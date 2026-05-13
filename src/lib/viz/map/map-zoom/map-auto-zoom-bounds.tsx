import { createLazyMemo } from '@solid-primitives/memo';
import { createMemo } from 'solid-js';
import {
	gameObjectNamesIgnoredInZoomZoneHollow,
	type ZoomZoneHollow,
} from '~/lib/game-data/hollow-data/zoom-zone-hollow';
import { Bounds } from '~/lib/game-data/shared/bounds';
import { binarySearchLastIndexBefore } from '~/lib/util/binary-search';
import { useAnimationStore } from '../../store/animation-store';
import { useAnimationTickStore } from '../../store/animation-tick-store';
import { useGameplayStore } from '../../store/gameplay-store';
import { useMapZoomStore } from '../../store/map-zoom-store';
import { useRoomDisplayStore } from '../../store/room-display-store';

export function createMapViewAutoZoomBounds() {
	const animationStore = useAnimationStore();
	const animationTickStore = useAnimationTickStore();
	const roomDisplayStore = useRoomDisplayStore();
	const mapZoomStore = useMapZoomStore();
	const gameplayStore = useGameplayStore();
	const gameModule = gameplayStore.gameModule;

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

	const AREA_CONTEXT_MEMORY_MS = 500;
	const AREA_CONTEXT_LOOKAHEAD_MS = 500;
	const AREA_REVISIT_LOOKAHEAD_MS = 5000;

	const currentSceneEventIndex = createLazyMemo(function computeCurrentSceneContext() {
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
			function getSceneEventMs(index) {
				return sceneEvents[index]!.msIntoGame;
			},
		);
		if (candidateIndex === -1) return null;

		const sceneEventIndex = candidateIndexes[candidateIndex] ?? -1;
		if (sceneEventIndex === -1) return null;

		return sceneEventIndex;
	});

	const zoomZoneBySceneEventIndex = createLazyMemo(function computeZoomZoneBySceneEventIndex() {
		const sceneEventIndexes = mainSceneEventIndexes();
		const sceneEvents = gameplayStore.recording()?.sceneEvents;
		const zoomZoneBySceneEventIndex: Map<number, ZoomZoneHollow | null> = new Map();

		let previousZoomZone: ZoomZoneHollow | null = null;
		for (const sceneEventIndex of sceneEventIndexes ?? []) {
			const sceneEvent = sceneEvents?.[sceneEventIndex];
			const mainRoomData = sceneEvent?.sceneName
				? gameModule()?.map.getMainRoomDataBySceneName(sceneEvent.sceneName)
				: null;
			if (!sceneEvent || !mainRoomData) {
				previousZoomZone = null;
				zoomZoneBySceneEventIndex.set(sceneEventIndex, null);
				continue;
			}

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
			zoomZoneBySceneEventIndex.set(sceneEventIndex, zoomZone);
			previousZoomZone = zoomZone;
		}

		return zoomZoneBySceneEventIndex;
	});

	const boundsByZoomZone = createLazyMemo(function computeBoundsByZoomZone() {
		const gameModule_ = gameplayStore.gameModule();
		if (gameModule_ == null) return { get: (_: ZoomZoneHollow) => null };
		const gameModule = gameModule_;
		const cache = new Map<ZoomZoneHollow, Bounds | null>();

		function get(zoomZone: ZoomZoneHollow) {
			if (cache.has(zoomZone)) {
				return cache.get(zoomZone);
			}

			const rooms = gameModule.map.rooms.filter(function isRoomInZoomZone(r) {
				return r.zoomZones.includes(zoomZone) && !gameObjectNamesIgnoredInZoomZoneHollow.has(r.gameObjectName);
			});
			if (rooms == null || rooms.length === 0) {
				cache.set(zoomZone, null);
				return null;
			}
			const bounds = Bounds.fromContainingBoundsIgnoreNull(
				rooms.map(function getRoomVisualBounds(r) {
					return r.visualBounds;
				}),
			);
			cache.set(zoomZone, bounds);
			return bounds;
		}

		return { get };
	});

	const areaSmoothBoundsWithTimes = createLazyMemo(function computeAreaSmoothBoundsWithTimes() {
		const sceneEventIndexes = mainSceneEventIndexes();
		const sceneEvents = gameplayStore.recording()?.sceneEvents;
		if (!sceneEventIndexes || sceneEventIndexes.length === 0 || !sceneEvents) return null;

		const zoomZonesWithTimes: { zoomZones: ZoomZoneHollow[]; msIntoGame: number }[] = [];

		const speed = animationStore.speedMultiplier();
		const direction: 1 | -1 = speed < 0 ? -1 : 1;
		const absSpeed = Math.abs(speed) || 1;
		const pastMs = AREA_CONTEXT_MEMORY_MS * absSpeed;
		const futureMs = AREA_CONTEXT_LOOKAHEAD_MS * absSpeed;
		// const revisitMs = AREA_REVISIT_LOOKAHEAD_MS * absSpeed; // TODO

		let lookaheadIndex = 0;
		const currentlyIncludedSceneEventIndexes: number[] = [];

		const changeTimesUnordered = new Set<number>();
		changeTimesUnordered.add(0);
		for (const sceneEventIndex of sceneEventIndexes) {
			const sceneEvent = sceneEvents[sceneEventIndex]!;
			const minMsIntoGame = sceneEvent.msIntoGame - (direction > 0 ? pastMs : futureMs);
			const maxMsIntoGame = sceneEvent.msIntoGame + (direction > 0 ? futureMs : pastMs);
			if (minMsIntoGame >= 0) {
				changeTimesUnordered.add(minMsIntoGame);
			}
			changeTimesUnordered.add(maxMsIntoGame);
		}

		// (1) compute initial zoom zones - smoothed via sliding window of past/future events.
		const changeTimes = Array.from(changeTimesUnordered).sort((a, b) => a - b);
		const zoomZoneBySceneEventIndex_ = zoomZoneBySceneEventIndex();
		for (const msIntoGame of changeTimes) {
			const minMsIntoGame = msIntoGame - pastMs;
			const maxMsIntoGame = msIntoGame + futureMs;

			// remove events that are no longer in the window
			while (
				currentlyIncludedSceneEventIndexes.length > 0 &&
				sceneEvents[currentlyIncludedSceneEventIndexes[0]!]!.msIntoGame < minMsIntoGame
			) {
				currentlyIncludedSceneEventIndexes.shift();
			}
			// add events that entered the window
			while (
				lookaheadIndex < sceneEventIndexes.length &&
				sceneEvents[sceneEventIndexes[lookaheadIndex]!]!.msIntoGame <= maxMsIntoGame
			) {
				currentlyIncludedSceneEventIndexes.push(sceneEventIndexes[lookaheadIndex]!);
				lookaheadIndex++;
			}

			// compute results
			const zoomZones = new Set<ZoomZoneHollow>();
			for (const includedSceneEventIndex of currentlyIncludedSceneEventIndexes) {
				const zoomZone = zoomZoneBySceneEventIndex_.get(includedSceneEventIndex);
				if (zoomZone) zoomZones.add(zoomZone);
			}
			zoomZonesWithTimes.push({ zoomZones: Array.from(zoomZones), msIntoGame });
		}

		// (2) adding zoom zones, that only shortly disappear?
		const revisitMs = AREA_REVISIT_LOOKAHEAD_MS * absSpeed;
		const possiblyExtendUntilMsPerZoomZone = new Map<ZoomZoneHollow, number>();
		const lastZoomZoneIndex = new Map<ZoomZoneHollow, number>();
		for (let i = 0; i < zoomZonesWithTimes.length; i++) {
			const current = zoomZonesWithTimes[i]!;
			const previous = zoomZonesWithTimes[i - 1];

			if (previous != null) {
				const newUtil = current.msIntoGame + revisitMs;
				previous.zoomZones.forEach((z) => {
					possiblyExtendUntilMsPerZoomZone.set(z, newUtil);
					lastZoomZoneIndex.set(z, i - 1);
				});
			}

			const newlyAddedZoomZones = new Set<ZoomZoneHollow>(current.zoomZones);
			previous?.zoomZones.forEach((z) => newlyAddedZoomZones.delete(z));

			for (const newZoomZone of newlyAddedZoomZones) {
				const extendUntilMs = possiblyExtendUntilMsPerZoomZone.get(newZoomZone) ?? 0;
				if (extendUntilMs > current.msIntoGame) {
					// add zoom zone to last changes
					let j = i - 1;
					const lastIndex = lastZoomZoneIndex.get(newZoomZone) ?? 0;
					while (j >= 0 && j > lastIndex) {
						zoomZonesWithTimes[j]!.zoomZones.push(newZoomZone);
						j--;
					}
				}
			}
		}

		// (3) convert to bounds
		const boundsByZone = boundsByZoomZone();
		const areaSmoothBoundsWithTimes = zoomZonesWithTimes.map((it) => {
			const boundsForZoomZones = it.zoomZones.map((it) => boundsByZone.get(it));
			const bounds = Bounds.fromContainingBoundsIgnoreNull(boundsForZoomZones);
			return { msIntoGame: it.msIntoGame, bounds };
		});

		return areaSmoothBoundsWithTimes;
	});

	const visibleRoomsExtends = createLazyMemo(function computeVisibleRoomsExtends() {
		const roomsVisible = roomDisplayStore.roomsVisible();
		const visibleRooms =
			roomsVisible === 'all'
				? gameModule()?.map.rooms
				: gameModule()?.map.rooms.filter(function isRoomVisible(r) {
						return roomsVisible.has(r.gameObjectName);
					});
		if (visibleRooms == null || visibleRooms.length === 0) return null;

		return Bounds.fromContainingBoundsIgnoreNull(
			visibleRooms.map(function getRoomVisualBounds(r) {
				return r.visualBounds;
			}),
		);
	});

	const currentZoneBounds = createLazyMemo(function computeCurrentZoneBounds() {
		const eventIndex = currentSceneEventIndex();
		const zoomZoneByEventIndex = zoomZoneBySceneEventIndex();
		if (eventIndex == null || zoomZoneByEventIndex == null) return null;
		const zoomZone = zoomZoneByEventIndex.get(eventIndex);
		if (!zoomZone) return null;
		const bounds = boundsByZoomZone().get(zoomZone);
		return bounds;
	});

	function getCurrentAreaBounds() {
		const boundsWithTime = areaSmoothBoundsWithTimes();
		const msIntoGame = animationStore.msIntoGame();
		if (boundsWithTime == null || boundsWithTime.length === 0) return null;
		const index = binarySearchLastIndexBefore(boundsWithTime, msIntoGame, (it) => it.msIntoGame);
		if (index === -1) return null;
		return boundsWithTime[index]!.bounds;
	}

	function getAutoTargetBounds() {
		const target = mapZoomStore.target();
		if (target === 'current-area') return currentZoneBounds();
		if (target === 'current-area-smooth') return getCurrentAreaBounds();
		if (target === 'visible-rooms') return visibleRoomsExtends();
		return null;
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

	return getAutoTargetBounds;
}
