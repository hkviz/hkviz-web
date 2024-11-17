import { cn } from '@hkviz/components';
import { Bounds, Vector2, type RoomInfo } from '@hkviz/parser';
import { createMemo, type Component } from 'solid-js';
import { HkMapRooms } from './hk-map-rooms';

export interface HKMapRoomProps {
    class?: string;
    roomInfos: RoomInfo[];
}

export const HKMapRoom: Component<HKMapRoomProps> = (props) => {
    const roomInfosOfRoom = createMemo(() => {
        const containingBounds = Bounds.fromContainingBounds(
            props.roomInfos.map((it) => it.allSpritesScaledPositionBounds),
        );
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

        return props.roomInfos.map((it) => {
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
    });

    return (
        <div class={cn('relative', props.class)}>
            <svg class="absolute inset-0" width="100%" height="100%" viewBox="0 0 1 1">
                <HkMapRooms
                    rooms={roomInfosOfRoom()}
                    alwaysShowMainRoom={true}
                    alwaysUseAreaAsColor={true}
                    highlightSelectedRoom={false}
                />
            </svg>
        </div>
    );
};
