'use client';

import * as d3 from 'd3';
import { useCallback, useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { type UseViewOptionsStore } from '~/lib/stores/view-options-store';
import { mapVisualExtends } from '../map-data/map-extends';
import { mainRoomDataBySceneName, roomData } from '../map-data/rooms';
import { gameObjectNamesIgnoredInZoomZone, type ZoomZone } from '../map-data/zoom-zone';
import { Bounds } from '../types/bounds';

const EMPTY_ARRAY = [] as const;

export function HKMapZoom({
    useViewOptionsStore,
    zoom,
    svg,
}: {
    useViewOptionsStore: UseViewOptionsStore;
    zoom: MutableRefObject<d3.ZoomBehavior<SVGSVGElement, unknown> | undefined>;
    svg: MutableRefObject<d3.Selection<SVGSVGElement, unknown, null, undefined> | undefined>;
}) {
    const animatedMsIntoGame = useViewOptionsStore((s) => s.animationMsIntoGame);
    const traceAnimationLengthMs = useViewOptionsStore((s) => s.traceAnimationLengthMs);
    const recording = useViewOptionsStore((s) => s.recording);
    const zoomFollowEnabled = useViewOptionsStore((s) => s.zoomFollowEnabled);
    const zoomFollowTarget = useViewOptionsStore((s) => s.zoomFollowTarget);
    const roomsVisible = useViewOptionsStore((s) => s.roomsVisible);

    const positionEvents = recording?.playerPositionEventsWithTracePosition;
    const sceneEvents = recording?.sceneEvents;

    const previousZoomZone = useRef<ZoomZone | null>(null);
    const zoomZone = useMemo(() => {
        if (!sceneEvents || !zoomFollowEnabled || zoomFollowTarget !== 'current-zone') return null;

        const sceneEventIndex =
            sceneEvents?.findLastIndex(
                (e) => e.msIntoGame <= animatedMsIntoGame && mainRoomDataBySceneName.get(e.sceneName)?.zoomZones,
            ) ?? -1;
        if (sceneEventIndex === -1) return null;
        const sceneEvent = sceneEvents[sceneEventIndex]!;
        const currentPossibleZoomZones = mainRoomDataBySceneName.get(sceneEvent.sceneName)!.zoomZones;
        const currentPossiblePrimaryZoomZone = currentPossibleZoomZones[0]!;

        let zoomZone: ZoomZone | null = null;

        if (currentPossiblePrimaryZoomZone === previousZoomZone.current) {
            // primary zoom zone is previous, therefore keep primary.
            zoomZone = currentPossiblePrimaryZoomZone;
        } else if (!previousZoomZone.current || !currentPossibleZoomZones.includes(previousZoomZone.current)) {
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
                if (!nextPossibleZoomZones.includes(previousZoomZone.current)) {
                    zoomEarly = true;
                    break;
                }
            }
            zoomZone = zoomEarly ? currentPossiblePrimaryZoomZone : previousZoomZone.current;
        }
        previousZoomZone.current = zoomZone;

        return zoomZone;
    }, [animatedMsIntoGame, sceneEvents, zoomFollowEnabled, zoomFollowTarget]);

    const visibleRoomsExtends = useMemo(() => {
        if (!zoomFollowEnabled || zoomFollowTarget !== 'visible-rooms') return null;
        const visibleRooms = roomData.filter((r) => roomsVisible === 'all' || roomsVisible.includes(r.gameObjectName));

        return Bounds.fromContainingBounds(visibleRooms.map((r) => r.visualBounds));
    }, [roomsVisible, zoomFollowEnabled, zoomFollowTarget]);

    const playerMovementBounds = useMemo(() => {
        if (!zoomFollowEnabled || zoomFollowTarget !== 'player-movement' || !positionEvents) return null;

        const minMsIntoGame = animatedMsIntoGame - traceAnimationLengthMs;
        const maxMsIntoGame = animatedMsIntoGame;

        return Bounds.fromContainingPoints(
            positionEvents
                .filter((it) => it.msIntoGame >= minMsIntoGame && it.msIntoGame <= maxMsIntoGame)
                .map((it) => it.mapPosition!),
        );
    }, [animatedMsIntoGame, positionEvents, traceAnimationLengthMs, zoomFollowEnabled, zoomFollowTarget]);

    const recentScenesBounds = useMemo(() => {
        if (!zoomFollowEnabled || zoomFollowTarget !== 'recent-scenes' || !sceneEvents) return null;

        const minMsIntoGame = animatedMsIntoGame - traceAnimationLengthMs;
        const maxMsIntoGame = animatedMsIntoGame;

        const filteredSceneEvents = sceneEvents
            .filter((it) => it.msIntoGame >= minMsIntoGame && it.msIntoGame <= maxMsIntoGame)
            .map((it) => mainRoomDataBySceneName.get(it.sceneName)?.visualBounds)
            .filter((it): it is Bounds => !!it);
        if (filteredSceneEvents.length === 0) return null;
        return Bounds.fromContainingBounds(filteredSceneEvents);
    }, [animatedMsIntoGame, sceneEvents, traceAnimationLengthMs, zoomFollowEnabled, zoomFollowTarget]);

    const zoomToBounds = useCallback(
        (bounds: Bounds) => {
            if (!svg.current || !zoom.current) return;
            const scale = Math.min(
                3.5, // is already zoomed in quite a bit, beyond that might be distracting in an animation
                Math.min(mapVisualExtends.size.x / bounds.size.x, mapVisualExtends.size.y / bounds.size.y) * 0.85,
            );

            svg.current.interrupt();
            const zoomBase = useViewOptionsStore.getState().zoomFollowTransitionIsEnabled()
                ? svg.current.transition().duration(useViewOptionsStore.getState().getZoomFollowTransitionSpeed())
                : svg.current;

            zoomBase.call(
                zoom.current.transform.bind(zoom.current),
                d3.zoomIdentity.scale(scale).translate(-bounds.center.x, -bounds.center.y),
            );
        },
        [svg, useViewOptionsStore, zoom],
    );

    useEffect(() => {
        if (!zoomZone) {
            return;
        }

        const rooms = roomData.filter(
            (r) => r.zoomZones.includes(zoomZone) && !gameObjectNamesIgnoredInZoomZone.has(r.gameObjectName),
        );
        if (rooms.length === 0) return;
        const bounds = Bounds.fromContainingBounds(rooms.map((r) => r.visualBounds));
        zoomToBounds(bounds);
    }, [zoomZone, zoomToBounds]);

    useEffect(() => {
        if (!visibleRoomsExtends) return;
        zoomToBounds(visibleRoomsExtends);
    }, [visibleRoomsExtends, zoomToBounds]);

    useEffect(() => {
        if (!playerMovementBounds) return;
        zoomToBounds(playerMovementBounds);
    }, [playerMovementBounds, zoomToBounds]);

    useEffect(() => {
        if (!recentScenesBounds) return;
        zoomToBounds(recentScenesBounds);
    }, [recentScenesBounds, zoomToBounds]);

    return <></>;
}
