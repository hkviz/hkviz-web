import type * as d3 from 'd3';
import { useEffect, useId, useMemo, useRef, type RefObject } from 'react';
import useEvent from 'react-use-event-hook';
import { useThemeStore } from '~/app/_components/theme-store';
import { type UseViewOptionsStore } from '~/app/run/[id]/_viewOptionsStore';
import { assertNever } from '~/lib/utils';
import { type RoomInfo, type RoomSpriteVariant } from '../map-data/rooms';
import { playerDataFields } from '../player-data/player-data';
import { useRoomColoring } from './use-room-coloring';

export function useMapRooms(
    {
        roomDataEnter,
        onClick = () => undefined,
        onMouseOver = () => undefined,
        onMouseOut = () => undefined,
        useViewOptionsStore,
        alwaysUseAreaAsColor = false,
        highlightSelectedRoom = true,
        spritesWithoutSubSprites = true,
    }: {
        roomDataEnter: RefObject<d3.Selection<d3.EnterElement, RoomInfo, SVGGElement, unknown> | undefined>;
        onClick?: (event: PointerEvent, r: RoomInfo) => void;
        onMouseOver?: (event: PointerEvent, r: RoomInfo) => void;
        onMouseOut?: (event: PointerEvent, r: RoomInfo) => void;
        useViewOptionsStore: UseViewOptionsStore;
        alwaysUseAreaAsColor?: boolean;
        highlightSelectedRoom?: boolean;
        spritesWithoutSubSprites?: boolean;
    },
    dependencies: unknown[],
) {
    const onMouseOverEvent = useEvent(onMouseOver);
    const onClickEvent = useEvent(onClick);
    const componentId = useId();

    const roomRects = useRef<d3.Selection<d3.BaseType, RoomInfo, SVGGElement, unknown> | undefined>(undefined);
    const roomOutlineRects = useRef<d3.Selection<d3.BaseType, RoomInfo, SVGGElement, unknown> | undefined>(undefined);
    const roomImgs = useRef<
        | d3.Selection<d3.BaseType, { sprite: RoomInfo['sprites'][number]; room: RoomInfo }, d3.BaseType, unknown>
        | undefined
    >(undefined);

    const mainEffectDependencies = [
        componentId,
        onClickEvent,
        onMouseOverEvent,
        roomDataEnter,
        spritesWithoutSubSprites,
        ...dependencies,
    ];

    const roomColoring = useRoomColoring({ useViewOptionsStore, alwaysUseAreaAsColor });
    const roomVisibility = useViewOptionsStore((state) => state.roomVisibility);
    const animationMsIntoGame = useViewOptionsStore((state) => state.animationMsIntoGame);
    const hoveredRoom = useViewOptionsStore((state) => state.hoveredRoom);
    const theme = useThemeStore((state) => state.theme);

    const scenesVisitedEvents = useViewOptionsStore(
        (state) => state.recording?.allPlayerDataEventsOfField?.(playerDataFields.byFieldName.scenesVisited) ?? [],
    );

    const visibleRooms = useMemo(() => {
        if (roomVisibility === 'visited') {
            return scenesVisitedEvents[scenesVisitedEvents.length - 1]?.value ?? [];
        } else if (roomVisibility === 'visited-animated') {
            return scenesVisitedEvents.findLast((it) => it.msIntoGame <= animationMsIntoGame)?.value ?? [];
        } else if (roomVisibility === 'all') {
            return 'all';
        } else {
            assertNever(roomVisibility);
        }
    }, [animationMsIntoGame, roomVisibility, scenesVisitedEvents]);

    useEffect(() => {
        if (!roomDataEnter.current) return;
        const roomGs = roomDataEnter.current
            .append('svg:g')
            .attr('data-scene-name', (r) => r.sceneName)
            .attr('data-game-object-name', (r) => r.gameObjectName);

        // mask for each rooms rect
        const roomMask = roomGs
            .append('svg:mask')
            .attr('id', (r) => 'mask_' + componentId + '_' + r.spritesByVariant.normal.name);

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
            .attr('xlink:href', (d) =>
                '/ingame-map/' + (spritesWithoutSubSprites ? d.sprite.nameWithoutSubSprites ?? d.sprite.name : d.sprite.name) + '.png',
            );

        // masks just for outline. Are created by using the original mask itself, and increasing the contrast
        // therefore effectively hiding semi transparent parts, aka the non-outline parts.
        const outlineMaskGroup = roomGs
            .append('svg:mask')
            .attr('id', (r) => 'outline_mask_' + componentId + '_' + r.spritesByVariant.normal.name)
            .append('svg:g')
            .style('filter', 'contrast(3)');

        outlineMaskGroup
            .append('svg:rect')
            .style('fill', 'black')
            .attr('x', (r) => r.allSpritesScaledPositionBounds.min.x)
            .attr('y', (r) => r.allSpritesScaledPositionBounds.min.y)
            .attr('width', (r) => r.allSpritesScaledPositionBounds.size.x)
            .attr('height', (r) => r.allSpritesScaledPositionBounds.size.y);

        outlineMaskGroup
            .append('svg:rect')
            .style('fill', 'white')
            .attr('mask', (r) => 'url(#mask_' + componentId + '_' + r.spritesByVariant.normal.name + ')')
            .attr('x', (r) => r.allSpritesScaledPositionBounds.min.x)
            .attr('y', (r) => r.allSpritesScaledPositionBounds.min.y)
            .attr('width', (r) => r.allSpritesScaledPositionBounds.size.x)
            .attr('height', (r) => r.allSpritesScaledPositionBounds.size.y);

        // actual rect which is masked by image. This allows us to have colorful rooms, while most images themselves are white
        roomRects.current = roomGs
            .append('svg:rect')
            .attr('data-scene-name', (r) => r.sceneName)
            .attr('class', 'svg-room')
            .attr('mask', (r) => 'url(#mask_' + componentId + '_' + r.spritesByVariant.normal.name + ')')
            // .attr('clip-path', (r) => 'url(#mask_' + componentId + '_' + r.spriteInfo.name + ')')

            .style('fill', (r) => r.color.formatHex())
            .attr('x', (r) => r.allSpritesScaledPositionBounds.min.x)
            .attr('y', (r) => r.allSpritesScaledPositionBounds.min.y)
            .attr('width', (r) => r.allSpritesScaledPositionBounds.size.x)
            .attr('height', (r) => r.allSpritesScaledPositionBounds.size.y)
            .style('transition', 'fill 0.1s')
            .on('mouseover', (event: PointerEvent, r) => {
                onMouseOverEvent(event, r);
            })
            .on('mouseout', (event: PointerEvent, r) => {
                onMouseOut(event, r);
            })
            .on('click', (event: PointerEvent, r) => {
                onClickEvent(event, r);
            });

        // outline
        roomOutlineRects.current = roomGs
            .append('svg:rect')
            .attr('mask', (r) => 'url(#outline_mask_' + componentId + '_' + r.spritesByVariant.normal.name + ')')
            .style('fill', 'white')
            .style('pointer-events', 'none')
            .attr('x', (r) => r.allSpritesScaledPositionBounds.min.x)
            .attr('y', (r) => r.allSpritesScaledPositionBounds.min.y)
            .attr('width', (r) => r.allSpritesScaledPositionBounds.size.x)
            .attr('height', (r) => r.allSpritesScaledPositionBounds.size.y);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, mainEffectDependencies);

    useEffect(() => {
        function isRoomVisible(gameObjectName: string) {
            return visibleRooms === 'all' || visibleRooms.includes(gameObjectName);
        }

        function getVariant(r: RoomInfo): RoomSpriteVariant | 'hidden' {
            const visible = isRoomVisible(r.gameObjectNameNeededInVisited);

            if (!visible) {
                return 'hidden';
            } else if (r.spritesByVariant.conditional && isRoomVisible(r.spritesByVariant.conditional.conditionalOn)) {
                return 'conditional';
            } else {
                return 'normal';
            }
        }

        roomImgs.current?.style('opacity', (d) => (getVariant(d.room) === d.sprite.variant ? '100%' : '0%'));

        roomRects.current?.style('pointer-events', (r) => (getVariant(r) !== 'hidden' ? 'all' : 'none'));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...mainEffectDependencies, visibleRooms]);

    useEffect(() => {
        roomRects.current?.style('fill', (r) => roomColoring.getRoomColor(r));
        roomOutlineRects.current?.style('visibility', (r) =>
            hoveredRoom === r.sceneName && highlightSelectedRoom ? 'visible' : 'hidden',
        );
        // ?.on('mouseover', null)
        // ?.on('mouseover', function (r) {
        //     d3.select(this).style('fill', roomColoring.getRoomColor(r));
        // })
        // ?.on('mouseout', null)
        // ?.on('mouseout', function (r) {
        //     d3.select(this).style('fill', d3.color(roomColoring.getRoomColor(r)).b);
        // });
    }, [...mainEffectDependencies, roomColoring, hoveredRoom, highlightSelectedRoom]);

    useEffect(() => {
        roomOutlineRects.current?.style('fill', theme === 'light' ? 'black' : 'white');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...mainEffectDependencies, theme]);
}
