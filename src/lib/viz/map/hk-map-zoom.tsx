import { createLazyMemo } from '@solid-primitives/memo';
import * as d3 from 'd3';
import { createEffect, createMemo, onCleanup, untrack } from 'solid-js';
import { Bounds } from '~/lib/game-data/shared/bounds';
import { Vector2 } from '~/lib/game-data/shared/vectors';
import { binarySearchLastIndexBefore, gameObjectNamesIgnoredInZoomZone, type ZoomZone } from '../../parser';
import {
	useAnimationStore,
	useAnimationTickStore,
	useGameplayStore,
	useMapZoomStore,
	useRoomDisplayStore,
} from '../store';

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
	function areaCandidatesBySceneName(sceneName: string): string[] {
		const mainRoomData = gameModule()?.map.getAllRoomDataBySceneNameWithSubSprites(sceneName);
		return mainRoomData ? mainRoomData.map((it) => it.mapZone) : [];
	}

	const mainSceneEventIndexes = createMemo(() => {
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

	const boundsByArea = createMemo(() => {
		const rooms = gameModule()?.map.rooms;
		if (!rooms) return new Map<string, Bounds>();
		return new Map(
			Map.groupBy(
				rooms.filter((room) => room.isMainGameObject),
				(room) => room.mapZone,
			)
				.entries()
				.map(([area, rooms]) => {
					const areaBounds = Bounds.fromContainingBoundsIgnoreNull(rooms.map((r) => r.visualBounds));
					return [area, areaBounds];
				}),
		);
	});
	const AREA_CONTEXT_MEMORY_MS = 500;
	const AREA_CONTEXT_LOOKAHEAD_MS = 500;
	const AREA_REVISIT_LOOKAHEAD_MS = 5000;
	const BOUNDS_EXTEND_TIME_SECONDS = 0.1;
	const BOUNDS_REDUCE_TIME_SECONDS = 0.1;
	const BOUNDS_REDUCE_TIME_SECONDS_AREA = 0.5;

	const boundsAnimator = {
		minX: 0,
		minY: 0,
		maxX: 0,
		maxY: 0,
		initialized: false,
	};
	const recentIncludedAreaAtMs = new Map<string, number>();

	const currentSceneContext = createLazyMemo(() => {
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
			(index) => sceneEvents[index]!.msIntoGame,
		);
		if (candidateIndex === -1) return null;

		const sceneEventIndex = candidateIndexes[candidateIndex] ?? -1;
		if (sceneEventIndex === -1) return null;

		const sceneEvent = sceneEvents[sceneEventIndex]!;
		const mainRoomData = gameModule()?.map.getMainRoomDataBySceneName(sceneEvent.sceneName);
		if (!mainRoomData) return null;

		return { sceneEvents, sceneEventIndex, sceneEvent, mainRoomData };
	});

	let previousZoomZone: ZoomZone | null = null;
	const zoomZone = createLazyMemo(() => {
		const target = mapZoomStore.target();
		if (target !== 'current-area') return null;
		const context = currentSceneContext();
		if (!context) return null;

		const { sceneEvents, sceneEventIndex, mainRoomData } = context;
		const currentPossibleZoomZones = mainRoomData.zoomZones;
		const currentPossiblePrimaryZoomZone = currentPossibleZoomZones[0]!;

		let zoomZone: ZoomZone | null = null;

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

	const visibleRoomsExtends = createLazyMemo(() => {
		const target = mapZoomStore.target();
		if (target !== 'visible-rooms') return null;
		const enabled = mapZoomStore.enabled();
		if (!enabled) return null;
		const roomsVisible = roomDisplayStore.roomsVisible();
		const visibleRooms = gameModule()?.map.rooms.filter(
			(r) => roomsVisible === 'all' || roomsVisible.has(r.gameObjectName),
		);
		if (visibleRooms == null || visibleRooms.length === 0) return null;

		return Bounds.fromContainingBoundsIgnoreNull(visibleRooms.map((r) => r.visualBounds));
	});

	const getBoundsTransform = (bounds: Bounds) => {
		const mapExtends = gameModule()?.map.extends;
		if (!mapExtends) return d3.zoomIdentity;
		const scale = Math.min(
			3.5,
			Math.min(mapExtends.size.x / bounds.size.x, mapExtends.size.y / bounds.size.y) * 0.97,
		);

		return d3.zoomIdentity
			.translate(mapExtends.center.x, mapExtends.center.y)
			.scale(scale)
			.translate(-bounds.center.x, -bounds.center.y);
	};

	const getCurrentViewBounds = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
		const mapExtends = gameModule()?.map.extends;
		const node = svg.node();
		if (!node || !mapExtends) return null;
		const transform = d3.zoomTransform(node);
		if (!Number.isFinite(transform.k) || transform.k <= 0) return null;

		const min = new Vector2(transform.invertX(mapExtends.min.x), transform.invertY(mapExtends.min.y));
		const max = new Vector2(transform.invertX(mapExtends.max.x), transform.invertY(mapExtends.max.y));
		return Bounds.fromMinMax(min, max);
	};

	const areaCandidatesForSceneName = (sceneName: string | null) => {
		if (!sceneName) return null;
		const candidates = areaCandidatesBySceneName(sceneName);
		if (candidates && candidates.length > 0) return candidates;
		const fallback = areaBySceneName(sceneName);
		return fallback ? [fallback] : null;
	};

	const areaForSceneName = (sceneName: string | null, preferredAreas?: Set<string>) => {
		const candidates = areaCandidatesForSceneName(sceneName);
		if (!candidates || candidates.length === 0) return null;
		if (preferredAreas) {
			for (const candidate of candidates) {
				if (preferredAreas.has(candidate)) return candidate;
			}
		}
		return candidates[0] ?? null;
	};

	const collectDirectionalAreas = ({
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
	}) => {
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
			const resolvedPreferredAreas =
				preferredAreas && preferredAreas.size > 0
					? new Set([...preferredAreas, ...areas])
					: areas.size > 0
						? areas
						: undefined;
			const area = areaForSceneName(event.sceneName, resolvedPreferredAreas);
			if (area) areas.add(area);
		}

		return areas;
	};

	const getCurrentZoneBounds = () => {
		const _zoomZone = zoomZone();
		if (!_zoomZone) return null;

		const rooms = gameModule()?.map.rooms.filter(
			(r) => r.zoomZones.includes(_zoomZone) && !gameObjectNamesIgnoredInZoomZone.has(r.gameObjectName),
		);
		if (rooms == null || rooms.length === 0) return null;
		return Bounds.fromContainingBoundsIgnoreNull(rooms.map((r) => r.visualBounds));
	};

	const getCurrentAreaBounds = () => {
		const context = currentSceneContext();
		if (!context) return null;

		const { sceneEvents, sceneEventIndex, sceneEvent, mainRoomData } = context;
		const gameNow = animationStore.msIntoGame();
		const speedMultiplier = animationStore.speedMultiplier();
		const isPlaying = animationStore.isPlaying() && speedMultiplier !== 0;
		const direction: 1 | -1 = isPlaying && speedMultiplier < 0 ? -1 : 1;
		// Convert real-time windows to game-time windows. Fall back to 1x when paused.
		const absSpeed = Math.abs(speedMultiplier) || 1;

		const preferredAreas = new Set(recentIncludedAreaAtMs.keys());
		const includedAreas = new Set<string>();
		const currentArea = areaForSceneName(sceneEvent.sceneName, preferredAreas) ?? mainRoomData.mapZone;
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
			: new Set<string>();
		for (const area of futureAreas) {
			includedAreas.add(area);
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
			: new Set<string>();

		const nowMs = performance.now();
		for (const area of includedAreas) {
			recentIncludedAreaAtMs.set(area, nowMs);
		}

		for (const [area, includedAtMs] of [...recentIncludedAreaAtMs.entries()]) {
			const ageMs = nowMs - includedAtMs;
			if (ageMs > AREA_CONTEXT_MEMORY_MS && !revisitSoonAreas.has(area)) {
				recentIncludedAreaAtMs.delete(area);
				continue;
			}
			includedAreas.add(area);
		}

		let bounds: Bounds | null = null;
		for (const area of includedAreas) {
			const areaBounds = boundsByArea().get(area);
			if (!areaBounds) continue;
			bounds = bounds ? Bounds.fromContainingBounds([bounds, areaBounds]) : areaBounds;
		}

		return bounds ?? visibleRoomsExtends();
	};

	const getAutoTargetBounds = () => {
		const target = mapZoomStore.target();
		if (target === 'current-area') return getCurrentZoneBounds();
		if (target === 'current-area-smooth') return getCurrentAreaBounds();
		if (target === 'visible-rooms') return visibleRoomsExtends();
		return null;
	};

	const resetBoundsAnimator = () => {
		boundsAnimator.initialized = false;
		recentIncludedAreaAtMs.clear();
	};

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

	createEffect(() => {
		const target = mapZoomStore.target();
		const enabled = mapZoomStore.enabled();
		const mapExtends = gameModule()?.map.extends;
		const usesAutoZoomMomentum =
			target === 'current-area' || target === 'current-area-smooth' || target === 'visible-rooms';
		if (!usesAutoZoomMomentum || !enabled || !mapExtends) {
			resetBoundsAnimator();
			return;
		}

		const removeTickListener = animationTickStore.addTickListener((deltaMs: number) => {
			untrack(() => {
				const svg = props.svg;
				const zoom = props.zoom;
				if (!svg || !zoom) return;

				const targetBounds = getAutoTargetBounds();
				if (!targetBounds) return;

				if (!mapZoomStore.transition()) {
					resetBoundsAnimator();
					svg.call(zoom.transform.bind(zoom), getBoundsTransform(targetBounds));
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

				const reduceTime =
					mapZoomStore.target() === 'current-area-smooth'
						? BOUNDS_REDUCE_TIME_SECONDS_AREA
						: BOUNDS_REDUCE_TIME_SECONDS;
				const alphaExtend = 1 - Math.exp(-dtSeconds / BOUNDS_EXTEND_TIME_SECONDS);
				const alphaReduce = 1 - Math.exp(-dtSeconds / reduceTime);

				const minXAlpha = targetBounds.min.x < boundsAnimator.minX ? alphaExtend : alphaReduce;
				const minYAlpha = targetBounds.min.y < boundsAnimator.minY ? alphaExtend : alphaReduce;
				const maxXAlpha = targetBounds.max.x > boundsAnimator.maxX ? alphaExtend : alphaReduce;
				const maxYAlpha = targetBounds.max.y > boundsAnimator.maxY ? alphaExtend : alphaReduce;

				boundsAnimator.minX += (targetBounds.min.x - boundsAnimator.minX) * minXAlpha;
				boundsAnimator.minY += (targetBounds.min.y - boundsAnimator.minY) * minYAlpha;
				boundsAnimator.maxX += (targetBounds.max.x - boundsAnimator.maxX) * maxXAlpha;
				boundsAnimator.maxY += (targetBounds.max.y - boundsAnimator.maxY) * maxYAlpha;

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

				const animatedBounds = Bounds.fromMinMax(
					new Vector2(boundsAnimator.minX, boundsAnimator.minY),
					new Vector2(boundsAnimator.maxX, boundsAnimator.maxY),
				);
				svg.call(zoom.transform.bind(zoom), getBoundsTransform(animatedBounds));
			});
		});

		onCleanup(() => {
			removeTickListener();
			resetBoundsAnimator();
		});
	});
}
