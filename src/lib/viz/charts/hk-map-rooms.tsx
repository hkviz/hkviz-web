import { useSignals } from '@preact/signals-react/runtime';
import { useEffect, useId, useState } from 'react';
import useEvent from 'react-use-event-hook';
import { currentTheme } from '~/app/_components/theme-store';
import { roomDisplayStatesByGameObjectName } from '~/lib/client-stage/room-display-state';
import { type UseViewOptionsStore } from '~/lib/client-stage/view-options-store';
import { type RoomInfo } from '../map-data/rooms';

function HkMapRoom({
    room,
    spritesWithoutSubSprites,
    onClick,
    onMouseOver,
    onMouseOut,
    highlightSelectedRoom,
    alwaysShowMainRoom,
}: {
    room: RoomInfo;
    spritesWithoutSubSprites: boolean;
    onClick: (event: React.MouseEvent, r: RoomInfo) => void;
    onMouseOver: (event: React.MouseEvent, r: RoomInfo) => void;
    onMouseOut: (event: React.MouseEvent, r: RoomInfo) => void;
    highlightSelectedRoom: boolean;
    alwaysShowMainRoom: boolean;
}) {
    useSignals();

    const states = roomDisplayStatesByGameObjectName.get(room.gameObjectName)!;
    const isVisible = (room.isMainGameObject && alwaysShowMainRoom) || states.isVisible.value;
    const isHighlighted = highlightSelectedRoom && states.isHovered.value;
    const variant = states.variant.value;

    const id = useId();
    const maskId = `mask_${id}_${room.gameObjectName}`;

    return (
        <g data-scene-name={room.sceneName} data-game-object-name={room.gameObjectName}>
            <mask id={maskId}>
                <rect style={{ fill: 'black' }}></rect>
                {room.sprites.map((sprite) => (
                    <image
                        key={sprite.variant}
                        data-scene-name="Deepnest_10"
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
                            opacity: variant === sprite.variant ? '100%' : '0%',
                        }}
                    ></image>
                ))}
            </mask>
            <rect
                mask={`url(#${maskId})`}
                x={room.allSpritesScaledPositionBounds.min.x}
                y={room.allSpritesScaledPositionBounds.min.y}
                width={room.allSpritesScaledPositionBounds.size.x}
                height={room.allSpritesScaledPositionBounds.size.y}
                style={{
                    fill: room.color.formatHex(),
                    transition: 'fill 0.1s ease 0s',
                    pointerEvents: isVisible ? 'all' : 'none',
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
            <g
                filter="url(#hover_mask_filter)"
                style={{
                    fill: currentTheme.value === 'dark' ? 'white' : 'black',
                    visibility: isHighlighted ? 'visible' : 'hidden',
                }}
            >
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
    const id = useId();
    const onMouseOverEvent = useEvent(onMouseOver);
    const onMouseOutEvent = useEvent(onMouseOut);
    const onClickEvent = useEvent(onClick);

    // const roomColoring = useRoomColoring({ useViewOptionsStore, alwaysUseAreaAsColor });
    // const visibleRooms = useViewOptionsStore((state) => state.roomsVisible);

    // const theme = useThemeStore((state) => state.theme);
    // const showAreaNames = useViewOptionsStore((s) => s.showAreaNames);
    // const showSubAreaNames = useViewOptionsStore((s) => s.showSubAreaNames);

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
                />
            ))}
        </g>
    );

    //     const roomTextGs = roomDataEnter.current
    //         .filter((d) => d.texts.length > 0)
    //         .append('svg:g')
    //         .attr('data-scene-name', (r) => r.sceneName)
    //         .attr('data-game-object-name', (r) => r.gameObjectName);

    //     function prepareText<T extends { text: AreaNameTextData }>(text: d3.Selection<d3.BaseType, T, any, any>) {
    //         return text
    //             .text((d) => hkLangString(d.text.sheetName as any, d.text.convoName) ?? d.text.convoName)
    //             .attr(
    //                 'class',
    //                 (d) =>
    //                     `drop-shadow-md pointer-events-none area-name-shadow ` +
    //                     (d.text.type === 'area' ? 'font-serif' : ebGaramond.className),
    //             )
    //             .attr('text-anchor', 'middle')
    //             .attr('dominant-baseline', 'central')
    //             .attr('x', (d) => d.text.bounds.center.x)
    //             .attr('y', (d) => d.text.bounds.center.y)
    //             .style('font-size', (d) =>
    //                 d.text.type === 'area'
    //                     ? `${d.text.fontSize * 0.125 * SCALE_FACTOR}px`
    //                     : `${d.text.fontSize * 0.075 * SCALE_FACTOR}px`,
    //             )
    //             .style('transition', 'opacity 0.1s');
    //     }

    //     subAreaNamesTexts.current = prepareText(
    //         roomTextGs
    //             .selectAll(null)
    //             .data((room) =>
    //                 room.texts
    //                     .map((text) => ({
    //                         room,
    //                         text,
    //                     }))
    //                     .filter((it) => !it.text.objectPath.includes('Next Area')),
    //             )
    //             .enter()
    //             .append('svg:text')
    //             .attr('data-scene-name', (d) => d.room.sceneName),
    //     );

    //     if (areaNameGs?.current) {
    //         areaNameTexts.current = prepareText(
    //             areaNameGs.current
    //                 .selectAll(null)
    //                 .data(areaNames.map((text) => ({ text })))
    //                 .enter()
    //                 .append('svg:text'),
    //         );
    //     }
    // }, [
    //     paramDependenciesChanges,
    //     id,
    //     onClickEvent,
    //     onMouseOverEvent,
    //     roomDataEnter,
    //     spritesWithoutSubSprites,
    //     onMouseOutEvent,
    //     areaNameGs,
    // ]);

    // useEffect(() => {
    //     if (areaNameTexts.current) {
    //         areaNameTexts.current.style('fill', (d) => {
    //             if (theme === 'light') {
    //                 return roomColoring.mode === 'area'
    //                     ? darkenRoomColorForLightTheme(d.text.color)
    //                     : 'rgba(0,0,0,0.8)';
    //             } else {
    //                 return roomColoring.mode === 'area' ? d.text.color.formatHex() : 'rgba(255,255,255,0.8)';
    //             }
    //         });
    //     }
    //     if (subAreaNamesTexts.current) {
    //         subAreaNamesTexts.current.style('fill', (d) => {
    //             if (theme === 'light') {
    //                 return roomColoring.mode === 'area'
    //                     ? darkenRoomColorForLightTheme(d.room.color)
    //                     : 'rgba(0,0,0,0.8)';
    //             } else {
    //                 return roomColoring.mode === 'area' ? d.room.color.formatHex() : 'rgba(255,255,255,0.8)';
    //             }
    //         });
    //     }
    // }, [roomColoring, theme]);

    // useEffect(() => {
    //     const isZoneVisible = memoize(
    //         (zoneName: string) =>
    //             visibleRooms === 'all' ||
    //             visibleRooms.some((it) => allRoomDataBySceneName.get(it)?.some((it) => it.mapZone === zoneName)),
    //         {
    //             maxSize: 100,
    //         },
    //     );

    //     function isTextTypeShowing(text: AreaNameTextData) {
    //         return text.type === 'area' ? showAreaNames : showSubAreaNames;
    //     }

    //     roomImgs.current?.style('opacity', (d) => (getVariant(d.room) === d.sprite.variant ? '100%' : '0%'));
    //     subAreaNamesTexts.current?.style('opacity', (d) =>
    //         isTextTypeShowing(d.text) && isRoomVisible(d.room.gameObjectNameNeededInVisited) && renderAreaNames
    //             ? '100%'
    //             : '0%',
    //     );
    //     areaNameTexts.current?.style('opacity', (d) =>
    //         isTextTypeShowing(d.text) && isZoneVisible(d.text.convoName) && renderAreaNames ? '100%' : '0%',
    //     );

    //     roomRects.current?.style('pointer-events', (r) => (getVariant(r) !== 'hidden' ? 'all' : 'none'));
    // }, [mainEffectChanges, visibleRooms, renderAreaNames, showAreaNames, showSubAreaNames]);

    // useEffect(() => {
    //     roomOutlineRects.current?.style('fill', theme === 'light' ? 'black' : 'white');
    // }, [mainEffectChanges, theme]);
}
