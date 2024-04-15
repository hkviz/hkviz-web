import { useSignalEffect } from '@preact/signals-react/runtime';
import { useEffect, useId, useRef, useState } from 'react';
import useEvent from 'react-use-event-hook';
import { roomColoringStore } from '~/lib/stores/room-coloring-store';
import { roomDisplayStore } from '~/lib/stores/room-display-store';
import { themeStore } from '~/lib/stores/theme-store';
import { type UseViewOptionsStore } from '~/lib/stores/view-options-store';
import { type RoomInfo, type RoomSpriteVariant } from '../map-data/rooms';

function HkMapRoom({
    room,
    spritesWithoutSubSprites,
    onClick,
    onMouseOver,
    onMouseOut,
    highlightSelectedRoom,
    alwaysShowMainRoom,
    alwaysUseAreaAsColor,
}: {
    room: RoomInfo;
    spritesWithoutSubSprites: boolean;
    onClick: (event: React.MouseEvent, r: RoomInfo) => void;
    onMouseOver: (event: React.MouseEvent, r: RoomInfo) => void;
    onMouseOut: (event: React.MouseEvent, r: RoomInfo) => void;
    highlightSelectedRoom: boolean;
    alwaysShowMainRoom: boolean;
    alwaysUseAreaAsColor: boolean;
}) {
    const states = roomDisplayStore.statesByGameObjectName.get(room.gameObjectName)!;

    const id = useId();
    const maskId = `mask_${id}_${room.gameObjectName}`;

    const outlineG = useRef<SVGGElement | null>(null);
    const rootRect = useRef<SVGRectElement | null>(null);
    const imageRefPerVariant = useRef(
        new Map<RoomSpriteVariant, SVGImageElement | null>(room.sprites.map((sprite) => [sprite.variant, null])),
    );

    useSignalEffect(() => {
        // update variant opacity
        const variant = states.variant.value;
        imageRefPerVariant.current.forEach((element, v) => {
            if (element) {
                element.style.opacity = variant === v ? '100%' : '0%';
            }
        });

        // update root pointer events
        const isVisible = (room.isMainGameObject && alwaysShowMainRoom) || states.isVisible.value;
        const pointerEvents = isVisible ? 'all' : 'none';
        rootRect.current!.style.pointerEvents = pointerEvents;
    });

    // update hover outline visibility
    useSignalEffect(() => {
        const isHighlighted = highlightSelectedRoom && states.isHovered.value;
        outlineG.current!.style.visibility = isHighlighted ? 'visible' : 'hidden';
    });

    // update hover outline color
    useSignalEffect(() => {
        const color = themeStore.currentTheme.value === 'dark' ? 'white' : 'black';
        outlineG.current!.style.fill = color;
    });

    useSignalEffect(() => {
        rootRect.current!.style.fill = alwaysUseAreaAsColor
            ? roomColoringStore.areaColorByGameObjectName.value.get(room.gameObjectName)!
            : roomColoringStore.selectedModeColorByGameObjectName.value.get(room.gameObjectName)!;
    });

    return (
        <g data-scene-name={room.sceneName} data-game-object-name={room.gameObjectName}>
            <mask id={maskId}>
                <rect style={{ fill: 'black' }}></rect>
                {room.sprites.map((sprite) => (
                    <image
                        key={sprite.variant}
                        ref={(element) => imageRefPerVariant.current.set(sprite.variant, element)}
                        data-variant={sprite.variant}
                        preserveAspectRatio="none"
                        x={sprite.scaledPosition.min.x}
                        y={sprite.scaledPosition.min.y}
                        width={sprite.scaledPosition.size.x}
                        height={sprite.scaledPosition.size.y}
                        xlinkHref={
                            '/ingame-map/' +
                            (spritesWithoutSubSprites ? sprite.nameWithoutSubSprites ?? sprite.name : sprite.name) +
                            '.png'
                        }
                        style={{
                            transition: 'opacity 0.1s ease 0s',
                        }}
                    ></image>
                ))}
            </mask>
            <rect
                ref={rootRect}
                mask={`url(#${maskId})`}
                x={room.allSpritesScaledPositionBounds.min.x}
                y={room.allSpritesScaledPositionBounds.min.y}
                width={room.allSpritesScaledPositionBounds.size.x}
                height={room.allSpritesScaledPositionBounds.size.y}
                style={{
                    transition: 'fill 0.1s ease 0s',
                }}
                onMouseOver={(event) => {
                    if (event.buttons === 0) {
                        // when holding down (because of drag) don't change hovered room
                        onMouseOver(event, room);
                    }
                }}
                onMouseOut={(event) => {
                    if (event.buttons === 0) {
                        // when holding down (because of drag) don't change hovered room
                        onMouseOut(event, room);
                    }
                }}
                onClick={(event) => onClick(event, room)}
            />
            <g ref={outlineG} filter="url(#hover_mask_filter)">
                <rect
                    mask={`url(#${maskId})`}
                    x={room.allSpritesScaledPositionBounds.min.x}
                    y={room.allSpritesScaledPositionBounds.min.y}
                    width={room.allSpritesScaledPositionBounds.size.x}
                    height={room.allSpritesScaledPositionBounds.size.y}
                    style={{ pointerEvents: 'none' }}
                ></rect>
            </g>
        </g>
    );
}

export function HkMapRooms({
    rooms,
    onClick = () => undefined,
    onMouseOver = () => undefined,
    onMouseOut = () => undefined,
    useViewOptionsStore,
    alwaysUseAreaAsColor = false,
    highlightSelectedRoom = true,
    spritesWithoutSubSprites = true,
    renderAreaNames = false,
    alwaysShowMainRoom = false,
}: {
    rooms: RoomInfo[];
    onClick?: (event: React.MouseEvent, r: RoomInfo) => void;
    onMouseOver?: (event: React.MouseEvent, r: RoomInfo) => void;
    onMouseOut?: (event: React.MouseEvent, r: RoomInfo) => void;
    useViewOptionsStore: UseViewOptionsStore;
    alwaysUseAreaAsColor?: boolean;
    highlightSelectedRoom?: boolean;
    spritesWithoutSubSprites?: boolean;
    renderAreaNames?: boolean;
    alwaysShowMainRoom?: boolean;
}) {
    const onMouseOverEvent = useEvent(onMouseOver);
    const onMouseOutEvent = useEvent(onMouseOut);
    const onClickEvent = useEvent(onClick);

    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(true);
    }, []);

    if (!show) return <></>;

    return (
        <g>
            {rooms.map((room) => (
                <HkMapRoom
                    key={room.gameObjectName}
                    room={room}
                    spritesWithoutSubSprites={spritesWithoutSubSprites}
                    onClick={onClickEvent}
                    onMouseOver={onMouseOverEvent}
                    onMouseOut={onMouseOutEvent}
                    highlightSelectedRoom={highlightSelectedRoom}
                    alwaysShowMainRoom={alwaysShowMainRoom}
                    alwaysUseAreaAsColor={alwaysUseAreaAsColor}
                />
            ))}
        </g>
    );
}
