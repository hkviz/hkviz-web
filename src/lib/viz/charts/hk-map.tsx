'use client';

import { cn } from '@/lib/utils';
import * as d3 from 'd3';
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { type UseViewOptionsStore } from '~/app/run/[id]/_viewOptionsStore';
import { mapVisualExtends } from '../map-data/map-extends';
import { mainRoomDataBySceneName, roomData, type RoomInfo } from '../map-data/rooms';
import { Bounds } from '../types/bounds';
import { MapLegend } from './legend';
import { HKMapTraces } from './traces-canvas';
import { useMapRooms } from './use-map-rooms';
import { useMapTraces } from './use-traces';

function HKMapZoom({
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
    const zoneName = useMemo(() => {
        const sceneName = recording?.sceneEvents.findLast((e) => e.msIntoGame <= animatedMsIntoGame)?.sceneName;
        if (!sceneName) return null;
        const roomData = mainRoomDataBySceneName.get(sceneName);
        return roomData?.zoneNameFormatted ?? null;
    }, [animatedMsIntoGame, recording]);

    useEffect(() => {
        if (!svg.current || !zoom.current) return;
        const rooms = roomData.filter((r) => r.zoneNameFormatted === zoneName);
        const bounds = Bounds.fromContainingBounds(rooms.map((r) => r.visualBounds));
        svg.current.call(
            zoom.current.transform.bind(zoom.current),
            d3.zoomIdentity.translate(-bounds.center.x, -bounds.center.y),
        );
    }, [svg, zoneName, zoom]);

    return <></>;
}

export interface HKMapProps {
    className?: string;
    useViewOptionsStore: UseViewOptionsStore;
}

export function HKMap({ className, useViewOptionsStore }: HKMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const svg = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined>>();
    const rootG = useRef<d3.Selection<SVGGElement, unknown, null, undefined>>();

    const zoom = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>();
    const tracesZoomHandler = useRef<(event: any) => void>();

    const animatedTraceG = useRef<d3.Selection<SVGGElement, unknown, null, undefined>>();
    const knightPinG = useRef<d3.Selection<SVGGElement, unknown, null, undefined>>();
    const roomDataEnter = useRef<d3.Selection<d3.EnterElement, RoomInfo, SVGGElement, unknown>>();

    const setSelectedRoomIfNotPinned = useViewOptionsStore((s) => s.setSelectedRoomIfNotPinned);
    const togglePinnedRoom = useViewOptionsStore((s) => s.togglePinnedRoom);
    const setSelectedRoomPinned = useViewOptionsStore((s) => s.setSelectedRoomPinned);

    const setHoveredRoom = useViewOptionsStore((s) => s.setHoveredRoom);
    const unsetHoveredRoom = useViewOptionsStore((s) => s.unsetHoveredRoom);

    useEffect(() => {
        zoom.current = d3
            .zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.25, 10])
            .translateExtent([
                [
                    mapVisualExtends.min.x - mapVisualExtends.size.x * 0.5,
                    mapVisualExtends.min.y - mapVisualExtends.size.y * 0.5,
                ],
                [
                    mapVisualExtends.max.x + mapVisualExtends.size.x * 0.5,
                    mapVisualExtends.max.y + mapVisualExtends.size.y * 0.5,
                ],
            ])
            .on('zoom', (event) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
                rootG.current!.attr('transform', event.transform);
                tracesZoomHandler.current?.(event);
            });
        svg.current = d3
            .select(containerRef.current)
            .insert('svg', ':first-child')
            .attr('class', 'absolute inset-0')
            .attr('width', 1000)
            .attr('height', 1000)
            .attr('viewBox', mapVisualExtends.toD3ViewBox())
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .call(zoom.current);

        rootG.current = svg.current.append('g').attr('data-group', 'root');

        roomDataEnter.current = rootG.current
            .append('g')
            .attr('data-group', 'rooms')
            .selectAll('rect')
            .data(roomData)
            .enter();

        animatedTraceG.current = rootG.current.append('g').attr('data-group', 'traces-animated');
        knightPinG.current = rootG.current.append('g').attr('data-group', 'knight-pin-g');

        return () => {
            svg.current?.remove();
        };
    }, []);

    useMapRooms(
        {
            roomDataEnter,
            onMouseOver: (event: PointerEvent, r) => {
                setSelectedRoomIfNotPinned(r.sceneName);
                setHoveredRoom(r.sceneName);
            },
            onMouseOut: (event: PointerEvent, r) => {
                unsetHoveredRoom(r.sceneName);
            },
            onClick: (event, r) => {
                if (event.pointerType !== 'touch') {
                    togglePinnedRoom(r.sceneName);
                } else {
                    setSelectedRoomPinned(false);
                    setSelectedRoomIfNotPinned(r.sceneName);
                }
            },
            useViewOptionsStore,
        },
        [],
    );

    useEffect(() => {
        function containerSizeChanged() {
            if (!containerRef.current || !svg.current) return;

            svg.current
                .attr('width', containerRef.current.offsetWidth)
                .attr('height', containerRef.current.offsetHeight);
        }
        containerSizeChanged();

        const resizeObserver = new ResizeObserver(containerSizeChanged);

        resizeObserver.observe(containerRef.current!);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    useMapTraces({ useViewOptionsStore, animatedTraceG, knightPinG });
    return (
        <div className={cn('relative', className)} ref={containerRef}>
            {false && <HKMapZoom useViewOptionsStore={useViewOptionsStore} svg={svg} zoom={zoom} />}
            <MapLegend useViewOptionsStore={useViewOptionsStore} />
            <HKMapTraces
                useViewOptionsStore={useViewOptionsStore}
                containerRef={containerRef}
                zoomHandler={tracesZoomHandler}
            />
        </div>
    );
}
