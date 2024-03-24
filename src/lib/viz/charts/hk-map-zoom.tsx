'use client';

import * as d3 from 'd3';
import { useEffect, useMemo, type MutableRefObject } from 'react';
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
    const recording = useViewOptionsStore((s) => s.recording);
    const zoomFollowZone = useViewOptionsStore((s) => s.zoomFollowZone);
    const zoneName = useMemo(() => {
        if (!zoomFollowZone) return null;
        const sceneName = recording?.sceneEvents.findLast((e) => e.msIntoGame <= animatedMsIntoGame)?.sceneName;
        if (!sceneName) return null;
        const roomData = mainRoomDataBySceneName.get(sceneName);
        return roomData?.zoneNameFormatted ?? null;
    }, [animatedMsIntoGame, recording?.sceneEvents, zoomFollowZone]);

    useEffect(() => {
        if (!zoneName) return;
        if (!svg.current || !zoom.current) return;
        const rooms = roomData.filter((r) => r.zoneNameFormatted === zoneName);
        if (rooms.length === 0) return;
        const bounds = Bounds.fromContainingBounds(rooms.map((r) => r.visualBounds));
        const scale = Math.min(
            3.5, // is already zoomed in quite a bit, beyond that might be distracting in an animation
            Math.min(mapVisualExtends.size.x / bounds.size.x, mapVisualExtends.size.y / bounds.size.y) - 0.4,
        );

        const zoomBase = useViewOptionsStore.getState().zoomFollowTransitionIsEnabled()
            ? svg.current.transition().duration(250)
            : svg.current;

        zoomBase.call(
            zoom.current.transform.bind(zoom.current),
            d3.zoomIdentity.scale(scale).translate(-bounds.center.x, -bounds.center.y),
        );
    }, [svg, useViewOptionsStore, zoneName, zoom]);

    return <></>;
}
