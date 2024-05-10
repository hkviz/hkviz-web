'use client';

import { cn } from '@/lib/utils';
import { mapVisualExtends, roomData, type RoomInfo } from '@hkviz/parser';
import { useSignals } from '@preact/signals-react/runtime';
import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import { mapZoomStore } from '~/lib/stores/map-zoom-store';
import { roomDisplayStore } from '~/lib/stores/room-display-store';
import { uiStore } from '~/lib/stores/ui-store';
import { HkMapTexts } from './hk-map-texts';
import { HKMapZoom } from './hk-map-zoom';
import { MapLegend } from './legend';
import { MapOverlayOptions } from './map-overlay-options';
import { appendOutlineFilter } from './svg-filters';
import { HKMapTraces } from './traces-canvas';
import { useMapTraces } from './use-traces';
import { HkMapRoomsWrapper } from '~/app/run/[id]/_dynamic_loader';

export interface HKMapProps {
    className?: string;
}

export function HKMap({ className }: HKMapProps) {
    useSignals();
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const svg = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined>>();
    const rootGRef = useRef<SVGGElement | null>(null);
    const rootG = useRef<d3.Selection<SVGGElement, unknown, null, undefined>>();
    const areaNameGs = useRef<d3.Selection<SVGGElement, unknown, null, undefined>>();

    const zoom = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>();
    const tracesZoomHandler = useRef<(event: any) => void>();

    const animatedTraceG = useRef<d3.Selection<SVGGElement, unknown, null, undefined>>();
    const knightPinG = useRef<d3.Selection<SVGGElement, unknown, null, undefined>>();
    const roomDataEnter = useRef<d3.Selection<d3.EnterElement, RoomInfo, SVGGElement, unknown>>();

    const isV1 = uiStore.isV1.value;

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
                    mapZoomStore.enabled.value = false;
                }

                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
                rootG.current!.attr('transform', event.transform);
                tracesZoomHandler.current?.(event);
            });
        svg.current = d3
            .select(svgRef.current!)
            .attr('width', 1000)
            .attr('height', 1000)
            .attr('viewBox', mapVisualExtends.toD3ViewBox())
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .call(zoom.current);

        const defs = svg.current.append('defs');
        appendOutlineFilter(defs);

        rootG.current = d3.select(rootGRef.current!);

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
            // svg.current?.remove();
            // svg.current?.selectChildren().remove();
        };
    }, []);

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

    if (isV1) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useMapTraces({ animatedTraceG, knightPinG });
    }
    return (
        <div className={cn('hk-main-map-wrapper relative', className)} ref={containerRef}>
            <svg className="absolute inset-0" ref={svgRef}>
                <g data-group="root" ref={rootGRef}>
                    <HkMapRoomsWrapper
                        rooms={roomData}
                        onMouseOver={(_, r) => {
                            roomDisplayStore.setSelectedRoomIfNotPinned(r.sceneName);
                            roomDisplayStore.setHoveredRoom(r.sceneName);
                        }}
                        onMouseOut={(_, r) => {
                            roomDisplayStore.unsetHoveredRoom(r.sceneName);
                        }}
                        onClick={(_, r) => {
                            console.log('clicked room', r);
                            // if (event.pointerType !== 'touch') {
                            roomDisplayStore.togglePinnedRoom(r.sceneName, 'map-room-click');
                            // } else {
                            // setSelectedRoomPinned(false);
                            // setSelectedRoomIfNotPinned(r.sceneName);
                            // }
                        }}
                    />
                    {!isV1 && <HkMapTexts />}
                </g>
            </svg>
            {!isV1 && <HKMapZoom svg={svg} zoom={zoom} />}
            <div className="absolute right-2 top-2 lg:top-10 xl:top-2">
                <MapLegend />
            </div>
            <HKMapTraces containerRef={containerRef} zoomHandler={tracesZoomHandler} />
            {!isV1 && (
                <div className="absolute bottom-2 right-2">
                    <MapOverlayOptions />
                </div>
            )}
        </div>
    );
}
