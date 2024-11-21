import {
	Bounds,
	gameObjectNamesIgnoredInZoomZone,
	mainRoomDataBySceneName,
	mapVisualExtends,
	roomData,
	type ZoomZone,
} from '../../parser';
import { animationStore, gameplayStore, mapZoomStore, roomDisplayStore, uiStore } from '../store';
import * as d3 from 'd3';
import { createEffect, createMemo, untrack } from 'solid-js';

interface HKMapZoomProps {
	zoom: d3.ZoomBehavior<SVGSVGElement, unknown> | undefined;
	svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | undefined;
}

// todo change away from props
export function createHKMapZoom(props: HKMapZoomProps) {
	let previousZoomZone: ZoomZone | null = null;
	const zoomZone = createMemo(() => {
		if (uiStore.isV1()) return null;
		const target = mapZoomStore.target();
		if (target !== 'current-zone') return null;
		const enabled = mapZoomStore.enabled();
		if (!enabled) return null;
		const sceneEvents = gameplayStore.recording()?.sceneEvents;
		if (!sceneEvents) return null;

		const sceneEventIndex =
			sceneEvents?.findLastIndex(
				(e) =>
					e.msIntoGame <= animationStore.msIntoGame() && mainRoomDataBySceneName.get(e.sceneName)?.zoomZones,
			) ?? -1;
		if (sceneEventIndex === -1) return null;
		const sceneEvent = sceneEvents[sceneEventIndex]!;
		const currentPossibleZoomZones = mainRoomDataBySceneName.get(sceneEvent.sceneName)!.zoomZones;
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
				const nextPossibleZoomZones = mainRoomDataBySceneName.get(nextSceneEvent.sceneName)?.zoomZones;
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

	const visibleRoomsExtends = createMemo(() => {
		if (uiStore.isV1()) return null;
		const target = mapZoomStore.target();
		if (target !== 'visible-rooms') return null;
		const enabled = mapZoomStore.enabled();
		if (!enabled) return null;
		const roomsVisible = roomDisplayStore.roomsVisible();
		const visibleRooms = roomData.filter((r) => roomsVisible === 'all' || roomsVisible.has(r.gameObjectName));

		return Bounds.fromContainingBounds(visibleRooms.map((r) => r.visualBounds));
	});

	const zoomToBounds = (bounds: Bounds) => {
		untrack(() => {
			const svg = props.svg;
			const zoom = props.zoom;
			if (!svg || !zoom) return;
			const scale = Math.min(
				3.5, // is already zoomed in quite a bit, beyond that might be distracting in an animation
				Math.min(mapVisualExtends.size.x / bounds.size.x, mapVisualExtends.size.y / bounds.size.y) * 0.85,
			);

			svg.interrupt();
			const zoomBase = mapZoomStore.transition() ? svg.transition().duration(mapZoomStore.transitionSpeed) : svg;

			zoomBase.call(
				zoom.transform.bind(zoom),
				d3.zoomIdentity.scale(scale).translate(-bounds.center.x, -bounds.center.y),
			);
		});
	};

	createEffect(() => {
		const _zoomZone = zoomZone();
		if (!_zoomZone) {
			return;
		}

		const rooms = roomData.filter(
			(r) => r.zoomZones.includes(_zoomZone) && !gameObjectNamesIgnoredInZoomZone.has(r.gameObjectName),
		);
		if (rooms.length === 0) return;
		const bounds = Bounds.fromContainingBounds(rooms.map((r) => r.visualBounds));
		zoomToBounds(bounds);
	});

	createEffect(() => {
		const _visibleRoomsExtends = visibleRoomsExtends();
		if (!_visibleRoomsExtends) return;
		zoomToBounds(_visibleRoomsExtends);
	});
}
