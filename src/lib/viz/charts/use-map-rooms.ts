import { type RefObject, useEffect, useId, useRef, use, useMemo } from 'react';
import { type RoomInfo } from '../map-data/rooms';
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
    const roomImgs = useRef<d3.Selection<d3.BaseType, RoomInfo, SVGGElement, unknown> | undefined>(undefined);

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
            .append('svg:image')
            .attr('data-scene-name', (r) => r.sceneName)
            .attr('preserveAspectRatio', 'none')
            .attr('class', 'svg-room');

        // actual rect which is masked by image. This allows us to have colorful rooms, while most images themselves are white
        roomRects.current = roomGs
            .append('svg:rect')
            .attr('data-scene-name', (r) => r.sceneName)
            .attr('class', 'svg-room')
            .attr('mask', (r) => 'url(#mask_' + componentId + '_' + r.spriteInfo.name + ')')
            .attr('clip-path', (r) => 'url(#mask_' + componentId + '_' + r.spriteInfo.name + ')')

            .style('fill', (r) => r.color.formatHex())
            .style('transition', 'opacity 0.075s ease-in-out')
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

        function getCorrectSpriteInfo(r: RoomInfo) {
            if (!r.conditionalSpriteInfo || !isRoomVisible(r.conditionalSpriteInfo.conditionalOn)) {
                return r.spriteInfo;
            } else {
                // needs more work to also have bounds of conditional sprites and use those instead.
                return r.conditionalSpriteInfo;
            }
        }

        roomRects.current
            ?.style('opacity', (r) => (isRoomVisible(r.gameObjectName) ? '100%' : '0%'))
            ?.style('pointer-events', (r) => (isRoomVisible(r.gameObjectName) ? 'all' : 'none'))
            ?.attr('x', (r) => getCorrectSpriteInfo(r).scaledPosition.min.x)
            ?.attr('y', (r) => getCorrectSpriteInfo(r).scaledPosition.min.y)
            ?.attr('width', (r) => getCorrectSpriteInfo(r).scaledPosition.size.x)
            ?.attr('height', (r) => getCorrectSpriteInfo(r).scaledPosition.size.y);

        roomImgs.current
            ?.attr('xlink:href', (r) => '/ingame-map/' + getCorrectSpriteInfo(r).name + '.png')
            ?.attr('x', (r) => getCorrectSpriteInfo(r).scaledPosition.min.x)
            ?.attr('y', (r) => getCorrectSpriteInfo(r).scaledPosition.min.y)
            ?.attr('width', (r) => getCorrectSpriteInfo(r).scaledPosition.size.x)
            ?.attr('height', (r) => getCorrectSpriteInfo(r).scaledPosition.size.y);

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
