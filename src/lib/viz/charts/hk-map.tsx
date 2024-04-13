'use client';

import { cn } from '@/lib/utils';
import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import { type UseViewOptionsStore } from '~/app/run/[id]/_viewOptionsStore';
import { mapVisualExtends } from '../map-data/map-extends';
import { roomData, type RoomInfo } from '../map-data/rooms';
import { HKMapZoom } from './hk-map-zoom';
import { MapLegend } from './legend';
import { MapOverlayOptions } from './map-overlay-options';
import { appendOutlineFilter } from './svg-filters';
import { HKMapTraces } from './traces-canvas';
import { useMapRooms } from './use-map-rooms';
import { useMapTraces } from './use-traces';

export interface HKMapProps {
    className?: string;
    useViewOptionsStore: UseViewOptionsStore;
}

export function HKMap({ className, useViewOptionsStore }: HKMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const svg = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined>>();
    const rootG = useRef<d3.Selection<SVGGElement, unknown, null, undefined>>();
    const areaNameGs = useRef<d3.Selection<SVGGElement, unknown, null, undefined>>();

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
    const isV1 = useViewOptionsStore((s) => s.isV1());

    const setZoomFollowEnabled = useViewOptionsStore((s) => s.setZoomFollowEnabled);

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
                if (event.sourceEvent) {
                    setZoomFollowEnabled(false);
                }

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

        const defs = svg.current.append('defs');
        appendOutlineFilter(defs);

        rootG.current = svg.current.append('g').attr('data-group', 'root');

        // rootG.current
        //     .append('rect')
        //     .attr('width', '100%')
        //     .attr('height', '100%')
        //     .attr('fill', 'yellow')
        //     .attr('fill-opacity', 0.2)
        //     .attr('x', mapVisualExtends.min.x)
        //     .attr('y', mapVisualExtends.min.y);

        roomDataEnter.current = rootG.current
            .append('g')
            .attr('data-group', 'rooms')
            .selectAll('rect')
            .data(roomData)
            .enter();

        animatedTraceG.current = rootG.current.append('g').attr('data-group', 'traces-animated');
        areaNameGs.current = rootG.current.append('g').attr('data-group', 'area-names');
        knightPinG.current = rootG.current.append('g').attr('data-group', 'knight-pin-g');

        return () => {
            svg.current?.remove();
        };
    }, [setZoomFollowEnabled]);

    useMapRooms(
        {
            roomDataEnter,
            areaNameGs,
            onMouseOver: (event: PointerEvent, r) => {
                setSelectedRoomIfNotPinned(r.sceneName);
                setHoveredRoom(r.sceneName);
            },
            onMouseOut: (event: PointerEvent, r) => {
                unsetHoveredRoom(r.sceneName);
            },
            onClick: (event, r) => {
                console.log('clicked room', r);
                if (event.pointerType !== 'touch') {
                    togglePinnedRoom(r.sceneName);
                } else {
                    setSelectedRoomPinned(false);
                    setSelectedRoomIfNotPinned(r.sceneName);
                }
            },
            useViewOptionsStore,
            renderAreaNames: !isV1,
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
            {!isV1 && <HKMapZoom useViewOptionsStore={useViewOptionsStore} svg={svg} zoom={zoom} />}
            <div className="absolute right-4 top-4 px-0 py-2">
                <MapLegend useViewOptionsStore={useViewOptionsStore} />
            </div>
            <HKMapTraces
                useViewOptionsStore={useViewOptionsStore}
                containerRef={containerRef}
                zoomHandler={tracesZoomHandler}
            />
            {!isV1 && (
                <div className="absolute bottom-4 right-4 px-0 py-2">
                    <MapOverlayOptions useViewOptionsStore={useViewOptionsStore} />
                </div>
            )}
        </div>
    );
}
