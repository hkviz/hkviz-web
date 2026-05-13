import { createLazyMemo } from '@solid-primitives/memo';
import * as d3 from 'd3';
import { createEffect, createMemo, onCleanup, untrack } from 'solid-js';
import {
	gameObjectNamesIgnoredInZoomZoneHollow,
	type ZoomZoneHollow,
} from '~/lib/game-data/hollow-data/zoom-zone-hollow';
import { Bounds } from '~/lib/game-data/shared/bounds';
import { Vector2 } from '~/lib/game-data/shared/vector2';
import { binarySearchLastIndexBefore } from '~/lib/util/binary-search';
import { useAnimationStore } from '../store/animation-store';
import { useAnimationTickStore } from '../store/animation-tick-store';
import { TickListenerOrder } from '../store/animation-tick-store';
import { useGameplayStore } from '../store/gameplay-store';
import { useMapZoomStore } from '../store/map-zoom-store';
import { useRoomDisplayStore } from '../store/room-display-store';

interface MapViewZoomProps {
	zoom: d3.ZoomBehavior<SVGSVGElement, unknown> | undefined;
	svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | undefined;
}

export function createMapViewZoom(props: MapViewZoomProps) {
	const animationStore = useAnimationStore();
	const animationTickStore = useAnimationTickStore();
	const roomDisplayStore = useRoomDisplayStore();
	const mapZoomStore = useMapZoomStore();
	const gameplayStore = useGameplayStore();
	const gameModule = gameplayStore.gameModule;

	// const roomsByZoomZone = createMemo(() => {
	// 	const roomsByZoomZone = new Map<ZoomZone, RoomDataAny[]>();
	// 	for (const room of gameModule()?.mapRooms ?? []) {
	// 		if (gameObjectNamesIgnoredInZoomZone.has(room.gameObjectName)) continue;
	// 		for (const zone of room.zoomZones) {
	// 			const existing = roomsByZoomZone.get(zone);
	// 			if (existing) {
	// 				existing.push(room);
	// 			} else {
	// 				roomsByZoomZone.set(zone, [room]);
	// 			}
	// 		}
	// 	}
	// 	return roomsByZoomZone;
	// });

	function areaBySceneName(sceneName: string): string | null {
		return gameModule()?.map.getMainRoomDataBySceneName(sceneName)?.mapZone ?? null;
	}
	// Per-game-module cache for the mapZone[] arrays returned by areaCandidatesBySceneName.
	// Without this, every scene event scanned by collectDirectionalAreas allocates a fresh array
	// each frame.
	let areaCandidatesCacheKey: ReturnType<typeof gameModule> | undefined;
	const areaCandidatesCache = new Map<string, string[]>();
	const EMPTY_AREA_CANDIDATES: string[] = [];
	function areaCandidatesBySceneName(sceneName: string): string[] {
		const gm = gameModule();
		if (gm !== areaCandidatesCacheKey) {
			areaCandidatesCacheKey = gm;
			areaCandidatesCache.clear();
		}
		const cached = areaCandidatesCache.get(sceneName);
		if (cached) return cached;
		const mainRoomData = gm?.map.getAllRoomDataBySceneNameWithSubSprites(sceneName);
		const result = mainRoomData
			? mainRoomData.map(function getMapZone(it) { return it.mapZone; })
			: EMPTY_AREA_CANDIDATES;
		areaCandidatesCache.set(sceneName, result);
		return result;
	}

	const mainSceneEventIndexes = createMemo(function computeMainSceneEventIndexes() {
		const sceneEvents = gameplayStore.recording()?.sceneEvents;
		if (!sceneEvents) return null;
		const indexes: number[] = [];
		for (let i = 0; i < sceneEvents.length; i++) {
			if (gameModule()?.map.getMainRoomDataBySceneName(sceneEvents[i]!.sceneName) != null) {
				indexes.push(i);
			}
		}
		return indexes;
	});

	const boundsByArea = createMemo(function computeBoundsByArea() {
		const rooms = gameModule()?.map.rooms;
		if (!rooms) return new Map<string, Bounds>();
		return new Map(
			Map.groupBy(
				rooms.filter(function isMainGameObject(room) { return room.isMainGameObject; }),
				function getRoomMapZone(room) { return room.mapZone; },
			)
				.entries()
				.map(function computeAreaBoundsEntry([area, rooms]) {
					const areaBounds = Bounds.fromContainingBoundsIgnoreNull(rooms.map(function getRoomVisualBounds(r) { return r.visualBounds; }));
					return [area, areaBounds] as const;
				}),
		);
	});
	const AREA_CONTEXT_MEMORY_MS = 500;
	const AREA_CONTEXT_LOOKAHEAD_MS = 500;
	const AREA_REVISIT_LOOKAHEAD_MS = 5000;
	const BOUNDS_EXTEND_TIME_SECONDS = 0.1;
	const BOUNDS_REDUCE_TIME_SECONDS = 0.1;
	const BOUNDS_REDUCE_TIME_SECONDS_AREA = 0.5;
	const AUTO_ZOOM_APPLY_EPSILON_RATIO = 0.00005;
	const AUTO_ZOOM_SNAP_TO_TARGET_EPSILON_RATIO = 0.00001;

	const boundsAnimator = {
		minX: 0,
		minY: 0,
		maxX: 0,
		maxY: 0,
		initialized: false,
	};
	const lastAppliedBounds = {
		minX: 0,
		minY: 0,
		maxX: 0,
		maxY: 0,
		initialized: false,
	};
	const recentIncludedAreaAtMs = new Map<string, number>();

	const currentSceneContext = createMemo(
		function computeCurrentSceneContext() {
			const enabled = mapZoomStore.enabled();
			if (!enabled) return null;
			const sceneEvents = gameplayStore.recording()?.sceneEvents;
			if (!sceneEvents) return null;
			const candidateIndexes = mainSceneEventIndexes();
			if (!candidateIndexes || candidateIndexes.length === 0) return null;
			const msIntoGame = animationStore.msIntoGame();

			const candidateIndex = binarySearchLastIndexBefore(
				candidateIndexes,
				msIntoGame,
				function getSceneEventMs(index) { return sceneEvents[index]!.msIntoGame; },
			);
			if (candidateIndex === -1) return null;

			const sceneEventIndex = candidateIndexes[candidateIndex] ?? -1;
			if (sceneEventIndex === -1) return null;

			const sceneEvent = sceneEvents[sceneEventIndex]!;
			const mainRoomData = gameModule()?.map.getMainRoomDataBySceneName(sceneEvent.sceneName);
			if (!mainRoomData) return null;

			return { sceneEvents, sceneEventIndex, sceneEvent, mainRoomData };
		},
		undefined,
		{
			// Prevents zoomZone (and currentZoneBounds) from being marked stale every
			// frame just because msIntoGame ticked — they only need to recompute when
			// the active scene event actually changes.
			equals(a, b) {
				if (a === b) return true;
				if (a == null || b == null) return false;
				return a.sceneEventIndex === b.sceneEventIndex && a.sceneEvents === b.sceneEvents;
			},
		},
	);

	let previousZoomZone: ZoomZoneHollow | null = null;
	const zoomZone = createLazyMemo(function computeZoomZone() {
		const target = mapZoomStore.target();
		if (target !== 'current-area') return null;
		const context = currentSceneContext();
		if (!context) return null;

		const { sceneEvents, sceneEventIndex, mainRoomData } = context;
		const currentPossibleZoomZones = mainRoomData.zoomZones;
		const currentPossiblePrimaryZoomZone = currentPossibleZoomZones[0]!;

		let zoomZone: ZoomZoneHollow | null = null;

		if (currentPossiblePrimaryZoomZone === previousZoomZone) {
			// primary zoom zone is previous, therefore keep primary.
			zoomZone = currentPossiblePrimaryZoomZone;
		} else if (!previousZoomZone || !currentPossibleZoomZones.includes(previousZoomZone)) {
			// previous zoom zone not possible anymore, zoom not preventable (theoretically one could choose a different zone, to potentially optimize further here).
			zoomZone = currentPossiblePrimaryZoomZone;
		} else {
			// here keeping the previous zoom zone is possible, but might not be a good idea, if a zoom is necessary soon anyways.
			let zoomEarly = false;
			for (let i = sceneEventIndex + 1; i < sceneEvents.length; i++) {
				const nextSceneEvent = sceneEvents[i]!;
				const nextPossibleZoomZones = gameModule()?.map.getMainRoomDataBySceneName(
					nextSceneEvent.sceneName,
				)?.zoomZones;
				if (!nextPossibleZoomZones) {
					// scene event will use previous zoom zone, which was checked in a previous loop iteration
					continue;
				}
				if (!nextPossibleZoomZones.includes(currentPossiblePrimaryZoomZone)) {
					// zoom to primary not necessary, since reached a scene where primary not possible, before previous not possible.
					break;
				}
				if (!nextPossibleZoomZones.includes(previousZoomZone)) {
					zoomEarly = true;
					break;
				}
			}
			zoomZone = zoomEarly ? currentPossiblePrimaryZoomZone : previousZoomZone;
		}
		previousZoomZone = zoomZone;

		return zoomZone;
	});

	const visibleRoomsExtends = createLazyMemo(function computeVisibleRoomsExtends() {
		const target = mapZoomStore.target();
		if (target !== 'visible-rooms') return null;
		const enabled = mapZoomStore.enabled();
		if (!enabled) return null;
		const roomsVisible = roomDisplayStore.roomsVisible();
		const visibleRooms = gameModule()?.map.rooms.filter(
			function isRoomVisible(r) { return roomsVisible === 'all' || roomsVisible.has(r.gameObjectName); },
		);
		if (visibleRooms == null || visibleRooms.length === 0) return null;

		return Bounds.fromContainingBoundsIgnoreNull(visibleRooms.map(function getRoomVisualBounds(r) { return r.visualBounds; }));
	});

	// Hot-path apply helpers — accept raw coordinates so the animator can call them without
	// allocating an intermediate Bounds object every frame.
	type MapExtends = NonNullable<ReturnType<typeof gameModule>>['map']['extends'];

	function getTransformFor(minX: number, minY: number, maxX: number, maxY: number, mapExtends: MapExtends) {
		const sizeX = maxX - minX;
		const sizeY = maxY - minY;
		const scale = Math.min(
			3.5,
			Math.min(mapExtends.size.x / sizeX, mapExtends.size.y / sizeY) * 0.97,
		);
		return d3.zoomIdentity
			.translate(mapExtends.center.x, mapExtends.center.y)
			.scale(scale)
			.translate(-(minX + sizeX / 2), -(minY + sizeY / 2));
	}

	function shouldApplyAt(minX: number, minY: number, maxX: number, maxY: number, mapExtends: MapExtends) {
		if (!lastAppliedBounds.initialized) return true;
		const epsilon = Math.max(mapExtends.size.x, mapExtends.size.y) * AUTO_ZOOM_APPLY_EPSILON_RATIO;
		return Math.max(
			Math.abs(minX - lastAppliedBounds.minX),
			Math.abs(minY - lastAppliedBounds.minY),
			Math.abs(maxX - lastAppliedBounds.maxX),
			Math.abs(maxY - lastAppliedBounds.maxY),
		) > epsilon;
	}

	function markAppliedAt(minX: number, minY: number, maxX: number, maxY: number) {
		lastAppliedBounds.minX = minX;
		lastAppliedBounds.minY = minY;
		lastAppliedBounds.maxX = maxX;
		lastAppliedBounds.maxY = maxY;
		lastAppliedBounds.initialized = true;
	}

	function getCurrentViewBounds(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
		const mapExtends = gameModule()?.map.extends;
		const node = svg.node();
		if (!node || !mapExtends) return null;
		const transform = d3.zoomTransform(node);
		if (!Number.isFinite(transform.k) || transform.k <= 0) return null;

		const min = new Vector2(transform.invertX(mapExtends.min.x), transform.invertY(mapExtends.min.y));
		const max = new Vector2(transform.invertX(mapExtends.max.x), transform.invertY(mapExtends.max.y));
		return Bounds.fromMinMax(min, max);
	}

	function areaCandidatesForSceneName(sceneName: string | null) {
		if (!sceneName) return null;
		const candidates = areaCandidatesBySceneName(sceneName);
		if (candidates && candidates.length > 0) return candidates;
		const fallback = areaBySceneName(sceneName);
		return fallback ? [fallback] : null;
	}

	function areaForSceneName(
		sceneName: string | null,
		preferredAreas?: { has(v: string): boolean },
		alsoPreferred?: { has(v: string): boolean },
	) {
		const candidates = areaCandidatesForSceneName(sceneName);
		if (!candidates || candidates.length === 0) return null;
		if (preferredAreas || alsoPreferred) {
			for (const candidate of candidates) {
				if (preferredAreas?.has(candidate) || alsoPreferred?.has(candidate)) return candidate;
			}
		}
		return candidates[0] ?? null;
	}

	function collectDirectionalAreas({
		sceneEvents,
		currentSceneEventIndex,
		gameNow,
		direction,
		windowMs,
		kind,
		preferredAreas,
	}: {
		sceneEvents: NonNullable<ReturnType<typeof gameplayStore.recording>>['sceneEvents'];
		currentSceneEventIndex: number;
		gameNow: number;
		direction: 1 | -1;
		windowMs: number;
		kind: 'past' | 'future';
		preferredAreas?: Set<string>;
	}) {
		const areas = new Set<string>();
		if (windowMs <= 0) return areas;

		const step = kind === 'past' ? (direction > 0 ? -1 : 1) : direction > 0 ? 1 : -1;
		const startIndex = kind === 'past' ? currentSceneEventIndex : currentSceneEventIndex + step;

		for (let i = startIndex; i >= 0 && i < sceneEvents.length; i += step) {
			const event = sceneEvents[i]!;
			const distance =
				direction > 0
					? kind === 'past'
						? gameNow - event.msIntoGame
						: event.msIntoGame - gameNow
					: kind === 'past'
						? event.msIntoGame - gameNow
						: gameNow - event.msIntoGame;
			if (distance < 0) continue;
			if (distance > windowMs) break;
			// avoid allocating a merged Set — check membership in both sets inline
			const area = areaForSceneName(event.sceneName, preferredAreas, areas);
			if (area) areas.add(area);
		}

		return areas;
	}

	const currentZoneBounds = createLazyMemo(function computeCurrentZoneBounds() {
		const _zoomZone = zoomZone();
		if (!_zoomZone) return null;

		const rooms = gameModule()?.map.rooms.filter(
			function isRoomInZoomZone(r) { return r.zoomZones.includes(_zoomZone) && !gameObjectNamesIgnoredInZoomZoneHollow.has(r.gameObjectName); },
		);
		if (rooms == null || rooms.length === 0) return null;
		return Bounds.fromContainingBoundsIgnoreNull(rooms.map(function getRoomVisualBounds(r) { return r.visualBounds; }));
	});

	function getCurrentAreaBounds() {
		const context = currentSceneContext();
		if (!context) return null;

		const { sceneEvents, sceneEventIndex, sceneEvent, mainRoomData } = context;
		const gameNow = animationStore.msIntoGame();
		const speedMultiplier = animationStore.speedMultiplier();
		const isPlaying = animationStore.isPlaying() && speedMultiplier !== 0;
		const direction: 1 | -1 = isPlaying && speedMultiplier < 0 ? -1 : 1;
		// Convert real-time windows to game-time windows. Fall back to 1x when paused.
		const absSpeed = Math.abs(speedMultiplier) || 1;

		const includedAreas = new Set<string>();
		const currentArea = areaForSceneName(sceneEvent.sceneName, recentIncludedAreaAtMs) ?? mainRoomData.mapZone;
		if (currentArea) includedAreas.add(currentArea);

		for (const area of collectDirectionalAreas({
			sceneEvents,
			currentSceneEventIndex: sceneEventIndex,
			gameNow,
			direction,
			windowMs: AREA_CONTEXT_MEMORY_MS * absSpeed,
			kind: 'past',
			preferredAreas: includedAreas,
		})) {
			includedAreas.add(area);
		}

		const futureAreas = isPlaying
			? collectDirectionalAreas({
					sceneEvents,
					currentSceneEventIndex: sceneEventIndex,
					gameNow,
					direction,
					windowMs: AREA_CONTEXT_LOOKAHEAD_MS * absSpeed,
					kind: 'future',
					preferredAreas: includedAreas,
				})
			: null;
		if (futureAreas) {
			for (const area of futureAreas) {
				includedAreas.add(area);
			}
		}

		const revisitSoonAreas = isPlaying
			? collectDirectionalAreas({
					sceneEvents,
					currentSceneEventIndex: sceneEventIndex,
					gameNow,
					direction,
					windowMs: AREA_REVISIT_LOOKAHEAD_MS * absSpeed,
					kind: 'future',
					preferredAreas: includedAreas,
				})
			: null;

		const nowMs = performance.now();
		for (const area of includedAreas) {
			recentIncludedAreaAtMs.set(area, nowMs);
		}

		const toDelete: string[] = [];
		for (const [area, includedAtMs] of recentIncludedAreaAtMs) {
			const ageMs = nowMs - includedAtMs;
			if (ageMs > AREA_CONTEXT_MEMORY_MS && !revisitSoonAreas?.has(area)) {
				toDelete.push(area);
				continue;
			}
			includedAreas.add(area);
		}
		for (const area of toDelete) {
			recentIncludedAreaAtMs.delete(area);
		}

		// Combine included area bounds in a single pass instead of allocating an intermediate
		// Bounds (and its [prev, next] array) on each iteration.
		const areaBoundsMap = boundsByArea();
		let firstBounds: Bounds | null = null;
		let minX = 0, minY = 0, maxX = 0, maxY = 0;
		let count = 0;
		for (const area of includedAreas) {
			const areaBounds = areaBoundsMap.get(area);
			if (!areaBounds) continue;
			if (count === 0) {
				firstBounds = areaBounds;
				minX = areaBounds.min.x;
				minY = areaBounds.min.y;
				maxX = areaBounds.max.x;
				maxY = areaBounds.max.y;
			} else {
				if (areaBounds.min.x < minX) minX = areaBounds.min.x;
				if (areaBounds.min.y < minY) minY = areaBounds.min.y;
				if (areaBounds.max.x > maxX) maxX = areaBounds.max.x;
				if (areaBounds.max.y > maxY) maxY = areaBounds.max.y;
			}
			count++;
		}
		if (count === 0) return visibleRoomsExtends();
		if (count === 1) return firstBounds;
		return Bounds.fromMinMax(new Vector2(minX, minY), new Vector2(maxX, maxY));
	}

	function getAutoTargetBounds() {
		const target = mapZoomStore.target();
		if (target === 'current-area') return currentZoneBounds();
		if (target === 'current-area-smooth') return getCurrentAreaBounds();
		if (target === 'visible-rooms') return visibleRoomsExtends();
		return null;
	}

	function resetBoundsAnimator() {
		boundsAnimator.initialized = false;
		lastAppliedBounds.initialized = false;
		recentIncludedAreaAtMs.clear();
	}

	// const hoveredRoomExtends = createMemo(() => {
	// 	if (uiStore.isV1()) return null;
	// 	// todo add disable
	// 	const enabled = mapZoomStore.enabled();
	// 	if (!enabled) return null;
	// 	const hoveredSceneName = roomDisplayStore.hoveredSceneName();
	// 	if (!hoveredSceneName) return null;
	// 	const hoveredRoomData = allRoomDataBySceneName.get(hoveredSceneName);
	// 	if (!hoveredRoomData) return null;
	// 	return Bounds.fromContainingBounds(hoveredRoomData.map((r) => r.visualBounds));
	// });

	// const zoomToBoundsWithHoveredRoom = (bounds: Bounds) => {
	// 	const _hoveredRoomExtends = hoveredRoomExtends();
	// 	if (!_hoveredRoomExtends) return zoomToBounds(bounds);
	// 	zoomToBounds(Bounds.fromContainingBounds([bounds, _hoveredRoomExtends]));
	// };

	createEffect(function autoZoomEffect() {
		const target = mapZoomStore.target();
		const enabled = mapZoomStore.enabled();
		const mapExtends = gameModule()?.map.extends;
		const usesAutoZoomMomentum =
			target === 'current-area' || target === 'current-area-smooth' || target === 'visible-rooms';
		if (!usesAutoZoomMomentum || !enabled || !mapExtends) {
			resetBoundsAnimator();
			return;
		}

		const reduceTime =
			target === 'current-area-smooth' ? BOUNDS_REDUCE_TIME_SECONDS_AREA : BOUNDS_REDUCE_TIME_SECONDS;
		// Tracks the previous frame's target Bounds by reference so we can skip the whole tick
		// when the target hasn't changed and we're already showing it.
		let lastTickTargetBounds: Bounds | null = null;

		const removeTickListener = animationTickStore.addTickListener(function autoZoomTick(deltaMs: number) {
			untrack(function autoZoomUntracked() {
				const svg = props.svg;
				const zoom = props.zoom;
				if (!svg || !zoom) return;

				const targetBounds = getAutoTargetBounds();
				if (!targetBounds) return;

				// Fast path: target Bounds is the same object as last frame AND we already applied
				// it. Nothing to animate, nothing to redraw. This is the common case once the user
				// has been sitting in a scene for a few frames.
				if (
					targetBounds === lastTickTargetBounds &&
					lastAppliedBounds.initialized &&
					lastAppliedBounds.minX === targetBounds.min.x &&
					lastAppliedBounds.minY === targetBounds.min.y &&
					lastAppliedBounds.maxX === targetBounds.max.x &&
					lastAppliedBounds.maxY === targetBounds.max.y
				) {
					return;
				}
				lastTickTargetBounds = targetBounds;

				const zoomTransform = zoom.transform.bind(zoom);

				if (!mapZoomStore.transition()) {
					resetBoundsAnimator();
					const tMinX = targetBounds.min.x;
					const tMinY = targetBounds.min.y;
					const tMaxX = targetBounds.max.x;
					const tMaxY = targetBounds.max.y;
					if (!shouldApplyAt(tMinX, tMinY, tMaxX, tMaxY, mapExtends)) return;
					svg.call(zoomTransform, getTransformFor(tMinX, tMinY, tMaxX, tMaxY, mapExtends));
					markAppliedAt(tMinX, tMinY, tMaxX, tMaxY);
					return;
				}

				if (!boundsAnimator.initialized) {
					const currentBounds = getCurrentViewBounds(svg) ?? targetBounds;
					boundsAnimator.minX = currentBounds.min.x;
					boundsAnimator.minY = currentBounds.min.y;
					boundsAnimator.maxX = currentBounds.max.x;
					boundsAnimator.maxY = currentBounds.max.y;
					boundsAnimator.initialized = true;
				}

				const dtSeconds = Math.min(0.05, Math.max(1 / 240, deltaMs / 1000));
				const alphaExtend = 1 - Math.exp(-dtSeconds / BOUNDS_EXTEND_TIME_SECONDS);
				const alphaReduce = 1 - Math.exp(-dtSeconds / reduceTime);

				const tMinX = targetBounds.min.x;
				const tMinY = targetBounds.min.y;
				const tMaxX = targetBounds.max.x;
				const tMaxY = targetBounds.max.y;

				const minXAlpha = tMinX < boundsAnimator.minX ? alphaExtend : alphaReduce;
				const minYAlpha = tMinY < boundsAnimator.minY ? alphaExtend : alphaReduce;
				const maxXAlpha = tMaxX > boundsAnimator.maxX ? alphaExtend : alphaReduce;
				const maxYAlpha = tMaxY > boundsAnimator.maxY ? alphaExtend : alphaReduce;

				boundsAnimator.minX += (tMinX - boundsAnimator.minX) * minXAlpha;
				boundsAnimator.minY += (tMinY - boundsAnimator.minY) * minYAlpha;
				boundsAnimator.maxX += (tMaxX - boundsAnimator.maxX) * maxXAlpha;
				boundsAnimator.maxY += (tMaxY - boundsAnimator.maxY) * maxYAlpha;

				const minSizeX = Math.max(1, mapExtends.size.x * 0.01);
				const minSizeY = Math.max(1, mapExtends.size.y * 0.01);
				if (boundsAnimator.maxX - boundsAnimator.minX < minSizeX) {
					const centerX = (boundsAnimator.maxX + boundsAnimator.minX) / 2;
					boundsAnimator.minX = centerX - minSizeX / 2;
					boundsAnimator.maxX = centerX + minSizeX / 2;
				}
				if (boundsAnimator.maxY - boundsAnimator.minY < minSizeY) {
					const centerY = (boundsAnimator.maxY + boundsAnimator.minY) / 2;
					boundsAnimator.minY = centerY - minSizeY / 2;
					boundsAnimator.maxY = centerY + minSizeY / 2;
				}

				// Snap to target when within epsilon — avoids endless tiny applies near convergence.
				const snapEpsilon =
					Math.max(mapExtends.size.x, mapExtends.size.y) * AUTO_ZOOM_SNAP_TO_TARGET_EPSILON_RATIO;
				const snapDelta = Math.max(
					Math.abs(boundsAnimator.minX - tMinX),
					Math.abs(boundsAnimator.minY - tMinY),
					Math.abs(boundsAnimator.maxX - tMaxX),
					Math.abs(boundsAnimator.maxY - tMaxY),
				);
				if (snapDelta <= snapEpsilon) {
					boundsAnimator.minX = tMinX;
					boundsAnimator.minY = tMinY;
					boundsAnimator.maxX = tMaxX;
					boundsAnimator.maxY = tMaxY;
				}

				const aMinX = boundsAnimator.minX;
				const aMinY = boundsAnimator.minY;
				const aMaxX = boundsAnimator.maxX;
				const aMaxY = boundsAnimator.maxY;
				if (!shouldApplyAt(aMinX, aMinY, aMaxX, aMaxY, mapExtends)) return;
				svg.call(zoomTransform, getTransformFor(aMinX, aMinY, aMaxX, aMaxY, mapExtends));
				markAppliedAt(aMinX, aMinY, aMaxX, aMaxY);
			});
		}, TickListenerOrder.AUTO_ZOOM);

		onCleanup(function cleanupAutoZoom() {
			removeTickListener();
			resetBoundsAnimator();
		});
	});
}
