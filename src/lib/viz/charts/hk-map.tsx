'use client';

import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import { mapVisualExtends } from '../map-data/map-extends';
import { SCALE_FACTOR, roomData } from '../map-data/rooms';
import { cn } from '@/lib/utils';
import { PlayerPositionEvent, type Recording } from '../recording-files/recording';
import { playerPositionToMapPosition } from '../map-data/player-position';

export interface HKMapProps {
    className?: string;
    recording: Recording | null;
}

export function HKMap({ className, recording }: HKMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const svg = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined>>();
    const rootG = useRef<d3.Selection<SVGGElement, unknown, null, undefined>>();

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

        rootG.current = svg.current.append('g');

        const roomGs = rootG.current
            .selectAll('rect')
            .data(roomData)
            .enter()
            .append('svg:g')
            .attr('data-scene-name', (r) => r.sceneName);

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
            // .attr('preserveAspectRatio', 'none')
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
            .style('fill', (r) => r.color.formatHex());

        return () => {
            svg.current?.remove();
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

    useEffect(() => {
        if (!recording) return;

        const points: [number, number][] = recording.sceneEvents
            .filter((event): event is PlayerPositionEvent => event instanceof PlayerPositionEvent)
            .map((event) => {
                const transformed = playerPositionToMapPosition(event.position, event.sceneEvent);
                if (!transformed) {
                    return undefined;
                }

                return [transformed.x, transformed.y];
            })
            .filter((event): event is [number, number] => !!event);
        const line = d3.line()(points);

        console.log('ctx', recording);
        rootG
            .current!.append('path')
            .attr('d', line)
            .attr('stroke-width', 0.05 * SCALE_FACTOR)
            .attr('stroke', 'red')
            .attr('fill', 'none');
    }, [recording]);

    return <div className={cn('relative', className)} ref={containerRef} />;
}
