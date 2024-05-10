import { type RoomInfo } from '@hkviz/parser';
import { roomColoringStore, roomDisplayStore, themeStore } from '@hkviz/viz';
import { For, createUniqueId } from 'solid-js';
import { render } from 'solid-js/web';

export function hkMapRoomRectClass({ gameObjectName }: { gameObjectName: string }) {
    return 'hk-map-room-react_' + gameObjectName;
}

function HkMapRoom({
    room,
    onClick,
    onMouseOver,
    onMouseOut,
    highlightSelectedRoom,
    alwaysShowMainRoom,
    alwaysUseAreaAsColor,
}: {
    room: RoomInfo;
    onClick?: (event: MouseEvent, r: RoomInfo) => void;
    onMouseOver?: (event: MouseEvent, r: RoomInfo) => void;
    onMouseOut?: (event: MouseEvent, r: RoomInfo) => void;
    highlightSelectedRoom: boolean;
    alwaysShowMainRoom: boolean;
    alwaysUseAreaAsColor: boolean;
}) {
    const states = roomDisplayStore.statesByGameObjectName.get(room.gameObjectName)!;

    const id = createUniqueId();
    const maskId = `mask_${id}_${room.gameObjectName}`;

    return (
        <g data-scene-name={room.sceneName} data-game-object-name={room.gameObjectName}>
            <mask id={maskId}>
                <rect style={{ fill: 'black' }}></rect>
                <For each={room.sprites}>
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
                                opacity: states.variant() === sprite.variant ? '100%' : '0%',
                            }}
                        />
                    )}
                </For>
            </mask>
            <rect
                class={hkMapRoomRectClass(room)}
                mask={`url(#${maskId})`}
                x={room.allSpritesScaledPositionBounds.min.x}
                y={room.allSpritesScaledPositionBounds.min.y}
                width={room.allSpritesScaledPositionBounds.size.x}
                height={room.allSpritesScaledPositionBounds.size.y}
                style={{
                    transition: 'fill 0.1s ease 0s',
                    fill: alwaysUseAreaAsColor
                        ? roomColoringStore.areaColorByGameObjectName().get(room.gameObjectName)
                        : roomColoringStore.selectedModeColorByGameObjectName().get(room.gameObjectName),
                    ['pointer-events']:
                        (room.isMainGameObject && alwaysShowMainRoom) || states.isVisible() ? 'all' : 'none',
                }}
                onMouseOver={(event) => {
                    if (event.buttons === 0) {
                        // when holding down (because of drag) don't change hovered room
                        onMouseOver?.(event, room);
                    }
                }}
                onMouseOut={(event) => {
                    if (event.buttons === 0) {
                        // when holding down (because of drag) don't change hovered room
                        onMouseOut?.(event, room);
                    }
                }}
                onClick={(event) => onClick?.(event, room)}
            />
            <g
                filter="url(#hover_mask_filter)"
                style={{
                    fill: themeStore.currentTheme() === 'dark' ? 'white' : 'black',
                    visibility: highlightSelectedRoom && states.isHovered() ? 'visible' : 'hidden',
                }}
            >
                <rect
                    mask={`url(#${maskId})`}
                    x={room.allSpritesScaledPositionBounds.min.x}
                    y={room.allSpritesScaledPositionBounds.min.y}
                    width={room.allSpritesScaledPositionBounds.size.x}
                    height={room.allSpritesScaledPositionBounds.size.y}
                    style={{ ['pointer-events']: 'none' }}
                ></rect>
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
