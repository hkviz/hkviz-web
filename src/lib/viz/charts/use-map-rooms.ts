import { type RefObject, useEffect, useId, useRef, use, useMemo } from 'react';
import { RoomSpriteVariant, type RoomInfo } from '../map-data/rooms';
import useEvent from 'react-use-event-hook';
import { type UseViewOptionsStore } from '~/app/run/[id]/_viewOptionsStore';
import * as d3 from 'd3';
import { useRoomColoring } from './use-room-coloring';
import { playerDataFields } from '../player-data/player-data';
import { assertNever } from '~/lib/utils';

export function useMapRooms(
    {
        roomDataEnter,
        onClick = () => undefined,
        onMouseOver = () => undefined,
        useViewOptionsStore,
        alwaysUseAreaAsColor = false,
    }: {
        roomDataEnter: RefObject<d3.Selection<d3.EnterElement, RoomInfo, SVGGElement, unknown> | undefined>;
        onClick?: (event: PointerEvent, r: RoomInfo) => void;
        onMouseOver?: (event: PointerEvent, r: RoomInfo) => void;
        useViewOptionsStore: UseViewOptionsStore;
        alwaysUseAreaAsColor?: boolean;
    },
    dependencies: unknown[],
) {
    const onMouseOverEvent = useEvent(onMouseOver);
    const onClickEvent = useEvent(onClick);
    const componentId = useId();

    const roomRects = useRef<d3.Selection<d3.BaseType, RoomInfo, SVGGElement, unknown> | undefined>(undefined);
    const roomImgs = useRef<
        | d3.Selection<d3.BaseType, { sprite: RoomInfo['sprites'][number]; room: RoomInfo }, d3.BaseType, unknown>
        | undefined
    >(undefined);

    const mainEffectDependencies = [componentId, onClickEvent, onMouseOverEvent, roomDataEnter, ...dependencies];

    const roomColoring = useRoomColoring({ useViewOptionsStore, alwaysUseAreaAsColor });
    const roomVisibility = useViewOptionsStore((state) => state.roomVisibility);
    const animationMsIntoGame = useViewOptionsStore((state) => state.animationMsIntoGame);

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
        const roomMask = roomGs.append('svg:mask').attr('id', (r) => 'mask_' + componentId + '_' + r.spriteInfo.name);

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
            .attr('xlink:href', (d) => '/ingame-map/' + d.sprite.name + '.png');

        // actual rect which is masked by image. This allows us to have colorful rooms, while most images themselves are white
        roomRects.current = roomGs
            .append('svg:rect')
            .attr('data-scene-name', (r) => r.sceneName)
            .attr('class', 'svg-room')
            .attr('mask', (r) => 'url(#mask_' + componentId + '_' + r.spriteInfo.name + ')')
            .attr('clip-path', (r) => 'url(#mask_' + componentId + '_' + r.spriteInfo.name + ')')

            .style('fill', (r) => r.color.formatHex())
            .attr('x', (r) => r.allSpritesScaledPositionBounds.min.x)
            .attr('y', (r) => r.allSpritesScaledPositionBounds.min.y)
            .attr('width', (r) => r.allSpritesScaledPositionBounds.size.x)
            .attr('height', (r) => r.allSpritesScaledPositionBounds.size.y)
            .style('transition', 'fill 0.1s')
            .on('mouseover', (event: PointerEvent, r) => {
                onMouseOverEvent(event, r);
            })
            .on('click', (event: PointerEvent, r) => {
                onClickEvent(event, r);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, mainEffectDependencies);

    useEffect(() => {
        function isRoomVisible(gameObjectName: string) {
            return visibleRooms === 'all' || visibleRooms.includes(gameObjectName);
        }

        function getVariant(r: RoomInfo): RoomSpriteVariant | 'hidden' {
            const visible = isRoomVisible(r.gameObjectName);

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
    }, [
        // eslint-disable-next-line react-hooks/exhaustive-deps
        ...mainEffectDependencies,
        roomColoring,
    ]);
}
