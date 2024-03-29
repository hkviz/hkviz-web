'use client';

import * as d3 from 'd3';
import { useCallback, useEffect, useMemo, type MutableRefObject } from 'react';
import { type UseViewOptionsStore } from '~/app/run/[id]/_viewOptionsStore';
import { mapVisualExtends } from '../map-data/map-extends';
import { mainRoomDataBySceneName, roomData } from '../map-data/rooms';
import { Bounds } from '../types/bounds';

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

    const zoneName = useMemo(() => {
        if (!zoomFollowEnabled || zoomFollowTarget !== 'current-zone') return null;
        const sceneName = recording?.sceneEvents.findLast((e) => e.msIntoGame <= animatedMsIntoGame)?.sceneName;
        if (!sceneName) return null;
        const roomData = mainRoomDataBySceneName.get(sceneName);
        return roomData?.zoneNameFormatted ?? null;
    }, [animatedMsIntoGame, recording?.sceneEvents, zoomFollowEnabled, zoomFollowTarget]);

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
                Math.min(mapVisualExtends.size.x / bounds.size.x, mapVisualExtends.size.y / bounds.size.y) * 0.9,
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
        if (!zoneName) return;
        const rooms = roomData.filter((r) => r.zoneNameFormatted === zoneName);
        if (rooms.length === 0) return;
        const bounds = Bounds.fromContainingBounds(rooms.map((r) => r.visualBounds));
        zoomToBounds(bounds);
    }, [zoneName, zoomToBounds]);

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
