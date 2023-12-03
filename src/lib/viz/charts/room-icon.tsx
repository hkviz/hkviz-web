'use client';

import { cn } from '@/lib/utils';
import * as d3 from 'd3';
import { useEffect, useId, useMemo, useRef } from 'react';
import { RoomInfo } from '../map-data/rooms';
import { makeD3MapRoom } from './make-d3-map-room';
import { Bounds } from '../types/bounds';
import { Vector2 } from '../types/vector2';

export interface HKMapProps {
    className?: string;
    roomInfos: RoomInfo[];
}

export function HKMapRoom({ className, roomInfos }: HKMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const svg = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined>>();
    const componentId = useId();

    useEffect(() => {
        const containingBounds = Bounds.fromContainingBounds(roomInfos.map((it) => it.spritePosition));
        const smallerRoomSizeProportion = containingBounds.size.minElement() / containingBounds.size.maxElement();
        const roomPositionWithin0To1 =
            containingBounds.size.x > containingBounds.size.y
                ? Bounds.fromMinSize(
                      new Vector2(0, (1 - smallerRoomSizeProportion) / 2),
                      new Vector2(1, smallerRoomSizeProportion),
                  )
                : Bounds.fromMinSize(
                      new Vector2((1 - smallerRoomSizeProportion) / 2, 0),
                      new Vector2(smallerRoomSizeProportion, 1),
                  );

        function relativeToRoomBounds(spritePosition: Bounds) {
            const x = Bounds.fromMinSize(
                new Vector2(
                    ((spritePosition.min.x - containingBounds.min.x) / containingBounds.size.x) *
                        roomPositionWithin0To1.size.x +
                        roomPositionWithin0To1.min.x,
                    ((spritePosition.min.y - containingBounds.min.y) / containingBounds.size.y) *
                        roomPositionWithin0To1.size.y +
                        roomPositionWithin0To1.min.y,
                ),
                new Vector2(
                    (spritePosition.size.x / containingBounds.size.x) * roomPositionWithin0To1.size.x,
                    (spritePosition.size.y / containingBounds.size.y) * roomPositionWithin0To1.size.y,
                ),
            );
            console.log({ containingBounds, x, roomPositionWithin0To1 });
            return x;
        }

        svg.current = d3
            .select(containerRef.current)
            .append('svg')
            .attr('class', 'absolute inset-0')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', [0, 0, 1, 1]);

        const roomDataEnter = svg.current
            .append('g')
            .attr('data-group', 'rooms')
            .selectAll('rect')
            .data(
                roomInfos.map((it) => ({
                    ...it,
                    spritePosition: relativeToRoomBounds(it.spritePosition),
                })),
            )
            .enter();

        makeD3MapRoom({
            roomDataEnter,
            componentId,
            preserveAspectRatio: 'none',
        });

        return () => {
            svg.current?.remove();
        };
    }, [componentId, roomInfos]);

    return useMemo(() => <div className={cn('relative', className)} ref={containerRef} />, [className, containerRef]);
}
