'use client';

import { cn } from '@/lib/utils';
import * as d3 from 'd3';
import { memo, useEffect, useMemo, useRef } from 'react';
import { type UseViewOptionsStore } from '~/app/run/[id]/_viewOptionsStore';
import { type RoomInfo } from '../map-data/rooms';
import { Bounds } from '../types/bounds';
import { Vector2 } from '../types/vector2';
import { useMapRooms } from './use-map-rooms';

export interface HKMapProps {
    className?: string;
    roomInfos: RoomInfo[];
    useViewOptionsStore: UseViewOptionsStore;
}

export const HKMapRoom = memo(function HKMapRoom({ className, roomInfos, useViewOptionsStore }: HKMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const svg = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined>>();
    const roomDataEnter = useRef<d3.Selection<d3.EnterElement, RoomInfo, SVGGElement, unknown>>();

    useEffect(() => {
        const containingBounds = Bounds.fromContainingBounds(roomInfos.map((it) => it.allSpritesScaledPositionBounds));
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
            return x;
        }

        svg.current = d3
            .select(containerRef.current)
            .append('svg')
            .attr('class', 'absolute inset-0')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', [0, 0, 1, 1]);

        roomDataEnter.current = svg.current
            .append('g')
            .attr('data-group', 'rooms')
            .selectAll('rect')
            .data(
                roomInfos.map((it) => {
                    const sprites = it.sprites.map((it) => ({
                        ...it,
                        scaledPosition: relativeToRoomBounds(it.scaledPosition),
                    }));
                    const spritesByVariant = Object.fromEntries(sprites.map((it) => [it.variant, it]));
                    return {
                        ...it,
                        sprites,
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
                        spritesByVariant: spritesByVariant as any,
                        allSpritesScaledPositionBounds: roomPositionWithin0To1,
                    };
                }),
            )
            .enter();

        return () => {
            svg.current?.remove();
        };
    }, [roomInfos]);

    useMapRooms(
        {
            roomDataEnter,
            useViewOptionsStore,
            alwaysUseAreaAsColor: true,
            highlightSelectedRoom: false,
            spritesWithoutSubSprites: false,
            alwaysShowMainRoom: true,
        },
        [roomInfos],
    );

    return useMemo(() => <div className={cn('relative', className)} ref={containerRef} />, [className, containerRef]);
});
