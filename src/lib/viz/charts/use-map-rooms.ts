import type * as d3 from 'd3';
import memoize from 'micro-memoize';
import { useEffect, useId, useMemo, useRef, type RefObject } from 'react';
import useEvent from 'react-use-event-hook';
import { useThemeStore } from '~/app/_components/theme-store';
import { type UseViewOptionsStore } from '~/app/run/[id]/_viewOptionsStore';
import { ebGaramond } from '~/styles/fonts';
import { useDependableEffect, useDynamicDependencies } from '../depdendent-effect';
import { hkLangString } from '../lang';
import { areaNames, type AreaNameTextData } from '../map-data/area-names';
import {
    allRoomDataBySceneName,
    mainRoomDataBySceneName,
    type RoomInfo,
    type RoomSpriteVariant,
} from '../map-data/rooms';
import { SCALE_FACTOR } from '../map-data/scaling';
import { darkenRoomColorForLightTheme, useRoomColoring } from './use-room-coloring';

export function useMapRooms(
    {
        roomDataEnter,
        areaNameGs,
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
        roomDataEnter: RefObject<d3.Selection<d3.EnterElement, RoomInfo, SVGGElement, unknown> | undefined>;
        areaNameGs?: RefObject<d3.Selection<SVGGElement, unknown, null, undefined> | undefined>;
        onClick?: (event: PointerEvent, r: RoomInfo) => void;
        onMouseOver?: (event: PointerEvent, r: RoomInfo) => void;
        onMouseOut?: (event: PointerEvent, r: RoomInfo) => void;
        useViewOptionsStore: UseViewOptionsStore;
        alwaysUseAreaAsColor?: boolean;
        highlightSelectedRoom?: boolean;
        spritesWithoutSubSprites?: boolean;
        renderAreaNames?: boolean;
        alwaysShowMainRoom?: boolean;
    },
    dependencies: unknown[],
) {
    const onMouseOverEvent = useEvent(onMouseOver);
    const onMouseOutEvent = useEvent(onMouseOut);
    const onClickEvent = useEvent(onClick);
    const componentId = useId();

    const roomRects = useRef<d3.Selection<d3.BaseType, RoomInfo, SVGGElement, unknown> | undefined>(undefined);
    const roomOutlineRects = useRef<d3.Selection<d3.BaseType, RoomInfo, SVGGElement, unknown> | undefined>(undefined);
    const roomImgs = useRef<
        | d3.Selection<d3.BaseType, { sprite: RoomInfo['sprites'][number]; room: RoomInfo }, d3.BaseType, unknown>
        | undefined
    >(undefined);
    const areaNameTexts = useRef<
        d3.Selection<d3.BaseType, { text: AreaNameTextData }, d3.BaseType, unknown> | undefined
    >(undefined);
    const subAreaNamesTexts = useRef<
        d3.Selection<d3.BaseType, { text: AreaNameTextData; room: RoomInfo }, d3.BaseType, unknown> | undefined
    >(undefined);

    const paramDependenciesChanges = useDynamicDependencies(dependencies);

    const roomColoring = useRoomColoring({ useViewOptionsStore, alwaysUseAreaAsColor });
    const visibleRooms = useViewOptionsStore((state) => state.roomsVisible);
    const hoveredRoom = useViewOptionsStore((state) => state.hoveredRoom);
    const hoveredMainRoom = useMemo(
        () => (hoveredRoom ? mainRoomDataBySceneName.get(hoveredRoom)?.sceneName : undefined),
        [hoveredRoom],
    );
    const theme = useThemeStore((state) => state.theme);
    const showAreaNames = useViewOptionsStore((s) => s.showAreaNames);
    const showSubAreaNames = useViewOptionsStore((s) => s.showSubAreaNames);

    // const visibleRooms = useMemo(() => {
    //     if (roomVisibility === 'visited') {
    //         return scenesVisitedEvents[scenesVisitedEvents.length - 1]?.value ?? [];
    //     } else if (roomVisibility === 'visited-animated') {
    //         return scenesVisitedEvents.findLast((it) => it.msIntoGame <= animationMsIntoGame)?.value ?? [];
    //     } else if (roomVisibility === 'all') {
    //         return 'all';
    //     } else {
    //         assertNever(roomVisibility);
    //     }
    // }, [animationMsIntoGame, roomVisibility, scenesVisitedEvents]);

    const mainEffectChanges = useDependableEffect(() => {
        if (!roomDataEnter.current) return;
        const roomGs = roomDataEnter.current
            .append('svg:g')
            .attr('data-scene-name', (r) => r.sceneName)
            .attr('data-game-object-name', (r) => r.gameObjectName);

        // mask for each rooms rect
        const roomMask = roomGs
            .append('svg:mask')
            .attr('id', (r, i) => 'mask_' + componentId + '_' + i + '_' + r.spritesByVariant.normal.name);

        roomMask
            .append('svg:rect')
            .attr('data-scene-name', (r) => r.sceneName)
            .attr('class', 'svg-room')
            .style('fill', 'black');

        roomImgs.current = roomMask
            .selectAll(null)
            .data((room) =>
                room.sprites.map((sprite) => ({
                    room,
                    sprite,
                })),
            )
            .enter()
            .append('svg:image')
            .attr('data-scene-name', (d) => d.room.sceneName)
            .attr('data-variant', (d) => d.sprite.variant)
            .attr('preserveAspectRatio', 'none')
            .attr('class', 'svg-room')
            .attr('x', (d) => d.sprite.scaledPosition.min.x)
            .attr('y', (d) => d.sprite.scaledPosition.min.y)
            .attr('width', (d) => d.sprite.scaledPosition.size.x)
            .attr('height', (d) => d.sprite.scaledPosition.size.y)
            .style('transition', 'opacity 0.1s')
            .attr(
                'xlink:href',
                (d) =>
                    '/ingame-map/' +
                    (spritesWithoutSubSprites ? d.sprite.nameWithoutSubSprites ?? d.sprite.name : d.sprite.name) +
                    '.png',
            );

        // actual rect which is masked by image. This allows us to have colorful rooms, while most images themselves are white
        roomRects.current = roomGs
            .append('svg:rect')
            .attr('data-scene-name', (r) => r.sceneName)
            .attr('class', 'svg-room')
            .attr('mask', (r, i) => 'url(#mask_' + componentId + '_' + i + '_' + r.spritesByVariant.normal.name + ')')
            // .attr('clip-path', (r) => 'url(#mask_' + componentId + '_' + r.spriteInfo.name + ')')

            .style('fill', (r) => r.color.formatHex())
            .attr('x', (r) => r.allSpritesScaledPositionBounds.min.x)
            .attr('y', (r) => r.allSpritesScaledPositionBounds.min.y)
            .attr('width', (r) => r.allSpritesScaledPositionBounds.size.x)
            .attr('height', (r) => r.allSpritesScaledPositionBounds.size.y)
            .style('transition', 'fill 0.1s')
            .on('mouseover', (event: PointerEvent, r) => {
                if (event.buttons === 0) {
                    // when holding down (because of drag) don't change hovered room
                    onMouseOverEvent(event, r);
                }
            })
            .on('mouseout', (event: PointerEvent, r) => {
                if (event.buttons === 0) {
                    // when holding down (because of drag) don't change hovered room
                    onMouseOutEvent(event, r);
                }
            })
            .on('click', (event: PointerEvent, r) => {
                onClickEvent(event, r);
            });

        // outline
        roomOutlineRects.current = roomGs.append('svg:g').attr('filter', 'url(#hover_mask_filter)');

        roomOutlineRects.current
            .append('svg:rect')
            .attr('mask', (r, i) => 'url(#mask_' + componentId + '_' + i + '_' + r.spritesByVariant.normal.name + ')')
            .attr('class', 'fill-current text-black dark:text-white')
            .style('pointer-events', 'none')
            .attr('x', (r) => r.allSpritesScaledPositionBounds.min.x)
            .attr('y', (r) => r.allSpritesScaledPositionBounds.min.y)
            .attr('width', (r) => r.allSpritesScaledPositionBounds.size.x)
            .attr('height', (r) => r.allSpritesScaledPositionBounds.size.y);

        const roomTextGs = roomDataEnter.current
            .filter((d) => d.texts.length > 0)
            .append('svg:g')
            .attr('data-scene-name', (r) => r.sceneName)
            .attr('data-game-object-name', (r) => r.gameObjectName);

        function prepareText<T extends { text: AreaNameTextData }>(text: d3.Selection<d3.BaseType, T, any, any>) {
            return text
                .text((d) => hkLangString(d.text.sheetName as any, d.text.convoName) ?? d.text.convoName)
                .attr(
                    'class',
                    (d) =>
                        `drop-shadow-md pointer-events-none area-name-shadow ` +
                        (d.text.type === 'area' ? 'font-serif' : ebGaramond.className),
                )
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'central')
                .attr('x', (d) => d.text.bounds.center.x)
                .attr('y', (d) => d.text.bounds.center.y)
                .style('font-size', (d) =>
                    d.text.type === 'area'
                        ? `${d.text.fontSize * 0.125 * SCALE_FACTOR}px`
                        : `${d.text.fontSize * 0.075 * SCALE_FACTOR}px`,
                )
                .style('transition', 'opacity 0.1s');
        }

        subAreaNamesTexts.current = prepareText(
            roomTextGs
                .selectAll(null)
                .data((room) =>
                    room.texts
                        .map((text) => ({
                            room,
                            text,
                        }))
                        .filter((it) => !it.text.objectPath.includes('Next Area')),
                )
                .enter()
                .append('svg:text')
                .attr('data-scene-name', (d) => d.room.sceneName),
        );

        if (areaNameGs?.current) {
            areaNameTexts.current = prepareText(
                areaNameGs.current
                    .selectAll(null)
                    .data(areaNames.map((text) => ({ text })))
                    .enter()
                    .append('svg:text'),
            );
        }
    }, [
        paramDependenciesChanges,
        componentId,
        onClickEvent,
        onMouseOverEvent,
        roomDataEnter,
        spritesWithoutSubSprites,
        onMouseOutEvent,
        areaNameGs,
    ]);

    useEffect(() => {
        if (areaNameTexts.current) {
            areaNameTexts.current.style('fill', (d) => {
                if (theme === 'light') {
                    return roomColoring.mode === 'area'
                        ? darkenRoomColorForLightTheme(d.text.color)
                        : 'rgba(0,0,0,0.8)';
                } else {
                    return roomColoring.mode === 'area' ? d.text.color.formatHex() : 'rgba(255,255,255,0.8)';
                }
            });
        }
        if (subAreaNamesTexts.current) {
            subAreaNamesTexts.current.style('fill', (d) => {
                if (theme === 'light') {
                    return roomColoring.mode === 'area'
                        ? darkenRoomColorForLightTheme(d.room.color)
                        : 'rgba(0,0,0,0.8)';
                } else {
                    return roomColoring.mode === 'area' ? d.room.color.formatHex() : 'rgba(255,255,255,0.8)';
                }
            });
        }
    }, [roomColoring, theme]);

    useEffect(() => {
        function isRoomVisible(gameObjectName: string) {
            return visibleRooms === 'all' || visibleRooms.includes(gameObjectName);
        }
        function isAnyRoomVisible(gameObjectNames: string[]) {
            return gameObjectNames && gameObjectNames.some(isRoomVisible);
        }
        const isZoneVisible = memoize(
            (zoneName: string) =>
                visibleRooms === 'all' ||
                visibleRooms.some((it) => allRoomDataBySceneName.get(it)?.some((it) => it.mapZone === zoneName)),
            {
                maxSize: 100,
            },
        );

        function getVariant(r: RoomInfo): RoomSpriteVariant | 'hidden' {
            const visible = isRoomVisible(r.gameObjectNameNeededInVisited);

            if (!visible && (!alwaysShowMainRoom || !r.isMainGameObject)) {
                return 'hidden';
            }

            let variant: RoomSpriteVariant;
            if (r.spritesByVariant.conditional && isAnyRoomVisible(r.spritesByVariant.conditional.conditionalOn)) {
                variant = 'conditional';
            } else {
                variant = 'normal';
            }
            if (r.spritesByVariant[variant]?.alwaysHidden) {
                return 'hidden';
            } else {
                return variant;
            }
        }

        function isTextTypeShowing(text: AreaNameTextData) {
            return text.type === 'area' ? showAreaNames : showSubAreaNames;
        }

        roomImgs.current?.style('opacity', (d) => (getVariant(d.room) === d.sprite.variant ? '100%' : '0%'));
        subAreaNamesTexts.current?.style('opacity', (d) =>
            isTextTypeShowing(d.text) && isRoomVisible(d.room.gameObjectNameNeededInVisited) && renderAreaNames
                ? '100%'
                : '0%',
        );
        areaNameTexts.current?.style('opacity', (d) =>
            isTextTypeShowing(d.text) && isZoneVisible(d.text.convoName) && renderAreaNames ? '100%' : '0%',
        );

        roomRects.current?.style('pointer-events', (r) => (getVariant(r) !== 'hidden' ? 'all' : 'none'));
    }, [mainEffectChanges, visibleRooms, renderAreaNames, showAreaNames, showSubAreaNames]);

    useEffect(() => {
        roomRects.current?.style('fill', (r) => roomColoring.getRoomColor(r));
        roomOutlineRects.current?.style('visibility', (r) =>
            (hoveredRoom === r.sceneName || hoveredMainRoom == r.sceneName) && highlightSelectedRoom
                ? 'visible'
                : 'hidden',
        );
        // ?.on('mouseover', null)
        // ?.on('mouseover', function (r) {
        //     d3.select(this).style('fill', roomColoring.getRoomColor(r));
        // })
        // ?.on('mouseout', null)
        // ?.on('mouseout', function (r) {
        //     d3.select(this).style('fill', d3.color(roomColoring.getRoomColor(r)).b);
        // });
    }, [mainEffectChanges, roomColoring, hoveredRoom, highlightSelectedRoom, hoveredMainRoom]);

    useEffect(() => {
        roomOutlineRects.current?.style('fill', theme === 'light' ? 'black' : 'white');
    }, [mainEffectChanges, theme]);
}
