import { type RoomInfo } from '@hkviz/parser';
import { roomColoringStore, roomDisplayStore, themeStore } from '@hkviz/viz';
import { For, createMemo, createUniqueId } from 'solid-js';
import { render } from 'solid-js/web';

export function hkMapRoomRectClass({ gameObjectName }: { gameObjectName: string }) {
    return 'hk-map-room-react_' + gameObjectName;
}

function HkMapRoom(props: {
    room: RoomInfo;
    onClick?: (event: MouseEvent, r: RoomInfo) => void;
    onMouseOver?: (event: MouseEvent, r: RoomInfo) => void;
    onMouseOut?: (event: MouseEvent, r: RoomInfo) => void;
    highlightSelectedRoom: boolean;
    alwaysShowMainRoom: boolean;
    alwaysUseAreaAsColor: boolean;
}) {
    const states = createMemo(() => roomDisplayStore.statesByGameObjectName.get(props.room.gameObjectName)!);

    const id = createUniqueId();
    const maskId = createMemo(() => `mask_${id}_${props.room.gameObjectName}`);

    return (
        <g data-scene-name={props.room.sceneName} data-game-object-name={props.room.gameObjectName}>
            <mask id={maskId()}>
                <rect style={{ fill: 'black' }} />
                <For each={props.room.sprites}>
                    {(sprite) => (
                        <image
                            data-variant={sprite.variant}
                            preserveAspectRatio="none"
                            x={sprite.scaledPosition.min.x}
                            y={sprite.scaledPosition.min.y}
                            width={sprite.scaledPosition.size.x}
                            height={sprite.scaledPosition.size.y}
                            href={'/ingame-map/' + (sprite.nameWithoutSubSprites ?? sprite.name) + '.png'}
                            style={{
                                transition: 'opacity 0.1s ease 0s',
                                opacity: states().variant() === sprite.variant ? '100%' : '0%',
                            }}
                        />
                    )}
                </For>
            </mask>
            <rect
                class={hkMapRoomRectClass(props.room)}
                mask={`url(#${maskId()})`}
                x={props.room.allSpritesScaledPositionBounds.min.x}
                y={props.room.allSpritesScaledPositionBounds.min.y}
                width={props.room.allSpritesScaledPositionBounds.size.x}
                height={props.room.allSpritesScaledPositionBounds.size.y}
                style={{
                    transition: 'fill 0.1s ease 0s',
                    fill: props.alwaysUseAreaAsColor
                        ? roomColoringStore.areaColorByGameObjectName().get(props.room.gameObjectName)
                        : roomColoringStore.selectedModeColorByGameObjectName().get(props.room.gameObjectName),
                    ['pointer-events']:
                        (props.room.isMainGameObject && props.alwaysShowMainRoom) || states().isVisible()
                            ? 'all'
                            : 'none',
                }}
                onMouseOver={(event) => {
                    if (event.buttons === 0) {
                        // when holding down (because of drag) don't change hovered room
                        props.onMouseOver?.(event, props.room);
                    }
                }}
                onMouseOut={(event) => {
                    if (event.buttons === 0) {
                        // when holding down (because of drag) don't change hovered room
                        props.onMouseOut?.(event, props.room);
                    }
                }}
                onClick={(event) => props.onClick?.(event, props.room)}
            />
            <g
                filter="url(#hover_mask_filter)"
                style={{
                    fill: themeStore.currentTheme() === 'dark' ? 'white' : 'black',
                    visibility: props.highlightSelectedRoom && states().isHovered() ? 'visible' : 'hidden',
                }}
            >
                <rect
                    mask={`url(#${maskId()})`}
                    x={props.room.allSpritesScaledPositionBounds.min.x}
                    y={props.room.allSpritesScaledPositionBounds.min.y}
                    width={props.room.allSpritesScaledPositionBounds.size.x}
                    height={props.room.allSpritesScaledPositionBounds.size.y}
                    style={{ ['pointer-events']: 'none' }}
                />
            </g>
        </g>
    );
}

export interface HkMapRoomsProps {
    rooms: RoomInfo[];
    onClick?: (event: MouseEvent, r: RoomInfo) => void;
    onMouseOver?: (event: MouseEvent, r: RoomInfo) => void;
    onMouseOut?: (event: MouseEvent, r: RoomInfo) => void;
    alwaysUseAreaAsColor?: boolean;
    highlightSelectedRoom?: boolean;
    alwaysShowMainRoom?: boolean;
}

export function HkMapRooms(props: HkMapRoomsProps) {
    return (
        <g>
            <For each={props.rooms}>
                {(room) => (
                    <HkMapRoom
                        room={room}
                        onClick={props.onClick}
                        onMouseOver={props.onMouseOver}
                        onMouseOut={props.onMouseOut}
                        highlightSelectedRoom={props.highlightSelectedRoom ?? true}
                        alwaysShowMainRoom={props.alwaysShowMainRoom ?? false}
                        alwaysUseAreaAsColor={props.alwaysUseAreaAsColor ?? false}
                    />
                )}
            </For>
        </g>
    );
}

export function renderHkMapRooms(props: HkMapRoomsProps, element: Element) {
    return render(() => <HkMapRooms {...props} />, element);
}
