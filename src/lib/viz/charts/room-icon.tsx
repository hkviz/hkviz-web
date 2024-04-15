'use client';

import { cn } from '@/lib/utils';
import { memo, useMemo } from 'react';
import { type UseViewOptionsStore } from '~/lib/stores/view-options-store';
import { type RoomInfo } from '../map-data/rooms';
import { Bounds } from '../types/bounds';
import { Vector2 } from '../types/vector2';
import { HkMapRooms } from './hk-map-rooms';

export interface HKMapProps {
    className?: string;
    roomInfos: RoomInfo[];
    useViewOptionsStore: UseViewOptionsStore;
}

export const HKMapRoom = memo(function HKMapRoom({ className, roomInfos, useViewOptionsStore }: HKMapProps) {
    const roomInfosOfRoom = useMemo(() => {
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

        return roomInfos.map((it) => {
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
        });
    }, [roomInfos]);

    return (
        <div className={cn('relative', className)}>
            <svg className="absolute inset-0" width="100%" height="100%" viewBox="0 0 1 1">
                <HkMapRooms
                    rooms={roomInfosOfRoom}
                    alwaysShowMainRoom={true}
                    alwaysUseAreaAsColor={true}
                    highlightSelectedRoom={false}
                />
            </svg>
        </div>
    );
});
