'use client';

import { cn } from '@/lib/utils';
import * as d3 from 'd3';
import { useEffect, useRef, useMemo, use } from 'react';
import { UseViewOptionsStore } from '~/app/run/[id]/_viewOptionsStore';
import { mapVisualExtends } from '../map-data/map-extends';
import { roomData } from '../map-data/rooms';
import { useMapTraces } from './use-traces';

export interface HKMapProps {
    className?: string;
    useViewOptionsStore: UseViewOptionsStore;
}

export function HKMap({ className, useViewOptionsStore }: HKMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const svg = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined>>();
    const rootG = useRef<d3.Selection<SVGGElement, unknown, null, undefined>>();

    const animatedTraceG = useRef<d3.Selection<SVGGElement, unknown, null, undefined>>();
    const knightPinG = useRef<d3.Selection<SVGGElement, unknown, null, undefined>>();

    const setSelectedRoomIfNotPinned = useViewOptionsStore((s) => s.setSelectedRoomIfNotPinned);
    const togglePinnedRoom = useViewOptionsStore((s) => s.togglePinnedRoom);
    const setSelectedRoomPinned = useViewOptionsStore((s) => s.setSelectedRoomPinned);

    useEffect(() => {
        svg.current = d3
            .select(containerRef.current)
            .append('svg')
            .attr('class', 'absolute inset-0')
            .attr('width', 1000)
            .attr('height', 1000)
            .attr('viewBox', mapVisualExtends.toD3ViewBox())
            .call(
                d3
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
                    }),
            );

        rootG.current = svg.current.append('g').attr('data-group', 'root');

        const roomGs = rootG.current
            .append('g')
            .attr('data-group', 'rooms')
            .selectAll('rect')
            .data(roomData)
            .enter()
            .append('svg:g')
            .attr('data-scene-name', (r) => r.sceneName);

        animatedTraceG.current = rootG.current.append('g').attr('data-group', 'traces-animated');
        knightPinG.current = rootG.current.append('g').attr('data-group', 'knight-pin-g');

        // mask for each rooms rect
        const roomMask = roomGs.append('svg:mask').attr('id', (r) => 'mask_' + r.spriteInfo.name);

        roomMask
            .append('svg:rect')
            .attr('data-scene-name', (r) => r.sceneName)
            .attr('x', (r) => r.spritePosition.min.x)
            .attr('y', (r) => r.spritePosition.min.y)
            .attr('width', (r) => r.spritePosition.size.x)
            .attr('height', (r) => r.spritePosition.size.y)
            .attr('class', 'svg-room')
            .style('fill', 'black');

        roomMask
            .append('svg:image')
            .attr('xlink:href', (r) => '/ingame-map/' + r.sprite + '.png')
            .attr('data-scene-name', (r) => r.sceneName)
            .attr('x', (r) => r.spritePosition.min.x)
            .attr('y', (r) => r.spritePosition.min.y)
            .attr('width', (r) => r.spritePosition.size.x)
            .attr('height', (r) => r.spritePosition.size.y)
            .attr('preserveAspectRatio', 'none')
            .attr('class', 'svg-room');

        // actual rect which is masked by image. This allows us to have colorful rooms, while most images themselves are white
        roomGs
            .append('svg:rect')
            .attr('data-scene-name', (r) => r.sceneName)
            .attr('x', (r) => r.spritePosition.min.x)
            .attr('y', (r) => r.spritePosition.min.y)
            .attr('width', (r) => r.spritePosition.size.x)
            .attr('height', (r) => r.spritePosition.size.y)
            .attr('class', 'svg-room')
            .attr('mask', (r) => 'url(#mask_' + r.spriteInfo.name + ')')
            .style('fill', (r) => r.color.formatHex())
            .on('mouseover', (event, r) => {
                setSelectedRoomIfNotPinned(r.sceneName);
            })
            .on('click', (event: PointerEvent, r) => {
                if (event.pointerType !== 'touch') {
                    togglePinnedRoom(r.sceneName);
                } else {
                    setSelectedRoomPinned(false);
                    setSelectedRoomIfNotPinned(r.sceneName);
                }
            });

        return () => {
            svg.current?.remove();
        };
    }, [togglePinnedRoom, setSelectedRoomIfNotPinned]);

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
    return useMemo(() => <div className={cn('relative', className)} ref={containerRef} />, [className, containerRef]);
}
