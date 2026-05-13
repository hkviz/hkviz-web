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

	// Per-game-module cache for the mapZone[] arrays returned by areaCandidatesBySceneName.
	// Without this, every scene event scanned each frame allocates a fresh array. The cache
	// also folds in the [fallback] array path so we never allocate per call.
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
		let result: string[];
		const subSpriteRooms = gm?.map.getAllRoomDataBySceneNameWithSubSprites(sceneName);
		if (subSpriteRooms && subSpriteRooms.length > 0) {
			result = subSpriteRooms.map(function getMapZone(it) { return it.mapZone; });
		} else {
			const fallback = gm?.map.getMainRoomDataBySceneName(sceneName)?.mapZone;
			result = fallback ? [fallback] : EMPTY_AREA_CANDIDATES;
		}
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

	function areaForSceneName(
		sceneName: string | null,
		preferredAreas?: { has(v: string): boolean },
		alsoPreferred?: { has(v: string): boolean },
	) {
		if (!sceneName) return null;
		const candidates = areaCandidatesBySceneName(sceneName);
		const count = candidates.length;
		if (count === 0) return null;
		// Hot path: the vast majority of scenes map to exactly one area, so skip the preference
		// scan entirely. preferredAreas/alsoPreferred only matter for multi-candidate scenes.
		if (count === 1) return candidates[0]!;
		if (preferredAreas || alsoPreferred) {
			// Skip the second .has() when both args reference the same Set (common: past/future
			// pass includedAreas as both preferredAreas and dest).
			const sameSet = preferredAreas === alsoPreferred;
			for (let i = 0; i < count; i++) {
				const candidate = candidates[i]!;
				if (preferredAreas?.has(candidate)) return candidate;
				if (!sameSet && alsoPreferred?.has(candidate)) return candidate;
			}
		}
		return candidates[0]!;
	}

	type SceneEvents = NonNullable<ReturnType<typeof gameplayStore.recording>>['sceneEvents'];

	// Walks past scene events (newest → oldest in playback order) and adds their areas to `dest`.
	function collectPastAreasInto(
		dest: Set<string>,
		sceneEvents: SceneEvents,
		currentSceneEventIndex: number,
		gameNow: number,
		direction: 1 | -1,
		windowMs: number,
	) {
		if (windowMs <= 0) return;
		const step = direction > 0 ? -1 : 1;
		for (let i = currentSceneEventIndex; i >= 0 && i < sceneEvents.length; i += step) {
			const event = sceneEvents[i]!;
			const distance = direction > 0 ? gameNow - event.msIntoGame : event.msIntoGame - gameNow;
			if (distance < 0) continue;
			if (distance > windowMs) break;
			const area = areaForSceneName(event.sceneName, dest);
			if (area) dest.add(area);
		}
	}

	// Walks future scene events (closest → farthest in playback order) and populates BOTH
	// `includedDest` (events within the smaller futureWindowMs) and `revisitDest` (events within
	// the larger revisitWindowMs). Since revisit is always a superset of future, one walk
	// covers both — eliminates one pass through 5000ms × speed worth of events per frame.
	function collectFutureAndRevisitInto(
		includedDest: Set<string>,
		revisitDest: Set<string>,
		sceneEvents: SceneEvents,
		currentSceneEventIndex: number,
		gameNow: number,
		direction: 1 | -1,
		futureWindowMs: number,
		revisitWindowMs: number,
	) {
		if (revisitWindowMs <= 0) return;
		const step = direction > 0 ? 1 : -1;
		for (let i = currentSceneEventIndex + step; i >= 0 && i < sceneEvents.length; i += step) {
			const event = sceneEvents[i]!;
			const distance = direction > 0 ? event.msIntoGame - gameNow : gameNow - event.msIntoGame;
			if (distance < 0) continue;
			if (distance > revisitWindowMs) break;
			const area = areaForSceneName(event.sceneName, includedDest, revisitDest);
			if (!area) continue;
			if (distance <= futureWindowMs) includedDest.add(area);
			revisitDest.add(area);
		}
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

	// Scratch sets reused across getCurrentAreaBounds calls to avoid allocating fresh Sets
	// every frame. They are cleared at the start of each computation.
	const includedAreasScratch = new Set<string>();
	const expiredAreasScratch: string[] = [];

	// Empty set used as the revisit-soon set when paused (no future/revisit window).
	const EMPTY_AREA_SET: ReadonlySet<string> = new Set<string>();

	type EventAreaSets = {
		// Areas in the past window + the event's own area. Used when paused.
		pastIncluded: ReadonlySet<string>;
		// pastIncluded ∪ areas in the future window. Used when playing.
		playingIncluded: ReadonlySet<string>;
		// Areas in the revisit window (= future-only events plus the future window). Used to
		// keep recent areas from expiring while a revisit is upcoming.
		revisitSoon: ReadonlySet<string>;
	};

	// Precomputed area sets for every main scene event index. Only depends on the recording, the
	// playback direction (sign of speed) and |speed| — all of which change rarely. The expensive
	// per-event scan that getCurrentAreaBounds used to do on every cache-miss frame is hoisted
	// here so it runs once per speed/direction change instead of every tick.
	//
	// Note: the precomputation centers each window at the event's own msIntoGame, so as gameNow
	// drifts within an event the windows are slightly off. The smooth bounds animator handles
	// that gracefully — area-set changes are stepped at event boundaries instead of sliding
	// continuously, and the difference is not visible.
	const eventAreaSets = createMemo(function computeEventAreaSets() {
		const sceneEvents = gameplayStore.recording()?.sceneEvents;
		if (!sceneEvents) return null;
		const mainIndexes = mainSceneEventIndexes();
		if (!mainIndexes || mainIndexes.length === 0) return null;
		const gm = gameModule();
		if (!gm) return null;

		const speed = animationStore.speedMultiplier();
		const direction: 1 | -1 = speed < 0 ? -1 : 1;
		const absSpeed = Math.abs(speed) || 1;
		const pastMs = AREA_CONTEXT_MEMORY_MS * absSpeed;
		const futureMs = AREA_CONTEXT_LOOKAHEAD_MS * absSpeed;
		const revisitMs = AREA_REVISIT_LOOKAHEAD_MS * absSpeed;

		const result = new Map<number, EventAreaSets>();
		for (const idx of mainIndexes) {
			const event = sceneEvents[idx]!;
			const mainRoomData = gm.map.getMainRoomDataBySceneName(event.sceneName);
			if (!mainRoomData) continue;

			const pastIncluded = new Set<string>();
			const currentArea = areaForSceneName(event.sceneName) ?? mainRoomData.mapZone;
			if (currentArea) pastIncluded.add(currentArea);
			collectPastAreasInto(pastIncluded, sceneEvents, idx, event.msIntoGame, direction, pastMs);

			const playingIncluded = new Set(pastIncluded);
			const revisitSoon = new Set<string>();
			collectFutureAndRevisitInto(
				playingIncluded, revisitSoon, sceneEvents, idx, event.msIntoGame, direction, futureMs, revisitMs,
			);

			result.set(idx, { pastIncluded, playingIncluded, revisitSoon });
		}
		return result;
	});

	// Result cache. With the precomputed event area sets, the only remaining per-frame work is
	// the hysteresis merge + bounds combination. We still cache the resulting Bounds so it has
	// a stable reference frame-to-frame — this lets the fast-path early-return in
	// autoZoomUntracked fire (it compares targetBounds by reference).
	let cachedAreaBoundsResult: Bounds | null = null;
	let cachedAreaBoundsForEventSets: EventAreaSets | undefined = undefined;
	let cachedAreaBoundsIsPlaying = false;
	let cachedAreaBoundsRecentMapVersion = -1;
	// Bumped whenever recentIncludedAreaAtMs is mutated in a way that could change the output.
	let recentMapVersion = 0;

	function getCurrentAreaBounds() {
		const context = currentSceneContext();
		if (!context) {
			cachedAreaBoundsResult = null;
			return null;
		}

		const sets = eventAreaSets();
		const eventSets = sets?.get(context.sceneEventIndex);
		if (!eventSets) {
			cachedAreaBoundsResult = null;
			return null;
		}

		const speedMultiplier = animationStore.speedMultiplier();
		const isPlaying = animationStore.isPlaying() && speedMultiplier !== 0;
		const realNow = performance.now();

		// Refresh timestamps for the event's "currently included" areas. This is cheap (a few
		// Map.set calls) and keeps the hysteresis behavior correct without needing to recompute.
		const baseIncluded = isPlaying ? eventSets.playingIncluded : eventSets.pastIncluded;
		for (const area of baseIncluded) {
			recentIncludedAreaAtMs.set(area, realNow);
		}

		// Expire stale entries from recentIncludedAreaAtMs that aren't being kept alive by the
		// upcoming-revisit lookahead. Bump recentMapVersion only if anything actually changes,
		// so the cache below can stay valid.
		const revisitSoon = isPlaying ? eventSets.revisitSoon : EMPTY_AREA_SET;
		const expired = expiredAreasScratch;
		expired.length = 0;
		for (const [area, includedAtMs] of recentIncludedAreaAtMs) {
			if (realNow - includedAtMs > AREA_CONTEXT_MEMORY_MS && !revisitSoon.has(area)) {
				expired.push(area);
			}
		}
		if (expired.length > 0) {
			for (const area of expired) recentIncludedAreaAtMs.delete(area);
			recentMapVersion++;
		}

		// Fast path: same event-set, same play state, and the recent-area map content hasn't
		// changed since the last compute. Reuse the cached Bounds reference.
		if (
			cachedAreaBoundsResult !== null &&
			eventSets === cachedAreaBoundsForEventSets &&
			isPlaying === cachedAreaBoundsIsPlaying &&
			recentMapVersion === cachedAreaBoundsRecentMapVersion
		) {
			return cachedAreaBoundsResult;
		}

		// Build the full included-areas set: precomputed base + any hysteresis-surviving entries.
		// recentIncludedAreaAtMs at this point only contains entries that haven't expired, so we
		// can include them all.
		const includedAreas = includedAreasScratch;
		includedAreas.clear();
		for (const area of baseIncluded) includedAreas.add(area);
		for (const area of recentIncludedAreaAtMs.keys()) includedAreas.add(area);

		// Combine included area bounds in a single pass — one Bounds allocation at most.
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

		let result: Bounds | null;
		if (count === 0) result = visibleRoomsExtends();
		else if (count === 1) result = firstBounds;
		else result = Bounds.fromMinMax(new Vector2(minX, minY), new Vector2(maxX, maxY));

		cachedAreaBoundsResult = result;
		cachedAreaBoundsForEventSets = eventSets;
		cachedAreaBoundsIsPlaying = isPlaying;
		cachedAreaBoundsRecentMapVersion = recentMapVersion;
		return result;
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
