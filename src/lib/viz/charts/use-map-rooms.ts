import { type RefObject, useEffect, useId, useRef } from 'react';
import { type RoomInfo } from '../map-data/rooms';
import useEvent from 'react-use-event-hook';
import { type UseViewOptionsStore } from '~/app/run/[id]/_viewOptionsStore';
import * as d3 from 'd3';
import { useRoomColoring } from './use-room-coloring';

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

    const aggregatedRunData = useViewOptionsStore((state) => state.aggregatedRunData);
    const roomColors = useViewOptionsStore((state) => state.roomColorMode);
    const roomColorVar1 = useViewOptionsStore((state) => state.roomColorVar1);
    const roomColorVar1Values = aggregatedRunData?.countPerScene;
    const roomColorVar1Max = aggregatedRunData?.maxOverScenes?.[roomColorVar1];

    const roomRects = useRef<d3.Selection<d3.BaseType, RoomInfo, SVGGElement, unknown> | undefined>(undefined);

    const mainEffectDependencies = [componentId, onClickEvent, onMouseOverEvent, roomDataEnter, ...dependencies];

    const roomColoring = useRoomColoring({ useViewOptionsStore, alwaysUseAreaAsColor });

    useEffect(() => {
        if (!roomDataEnter.current) return;
        const roomGs = roomDataEnter.current.append('svg:g').attr('data-scene-name', (r) => r.sceneName);

        // mask for each rooms rect
        const roomMask = roomGs.append('svg:mask').attr('id', (r) => 'mask_' + componentId + '_' + r.spriteInfo.name);

        roomMask
            .append('svg:rect')
            .attr('data-scene-name', (r) => r.sceneName)
            .attr('x', (r) => r.spritePosition.min.x)
            .attr('y', (r) => r.spritePosition.min.y)
            .attr('width', (r) => r.spritePosition.size.x)
            .attr('height', (r) => r.spritePosition.size.y)
            .attr('class', 'svg-room')
            .style('fill', 'black');

        roomMask
            .append('svg:image')
            .attr('xlink:href', (r) => '/ingame-map/' + r.sprite + '.png')
            .attr('data-scene-name', (r) => r.sceneName)
            .attr('x', (r) => r.spritePosition.min.x)
            .attr('y', (r) => r.spritePosition.min.y)
            .attr('width', (r) => r.spritePosition.size.x)
            .attr('height', (r) => r.spritePosition.size.y)
            .attr('preserveAspectRatio', 'none')
            .attr('class', 'svg-room');

        // actual rect which is masked by image. This allows us to have colorful rooms, while most images themselves are white
        roomRects.current = roomGs
            .append('svg:rect')
            .attr('data-scene-name', (r) => r.sceneName)
            .attr('x', (r) => r.spritePosition.min.x)
            .attr('y', (r) => r.spritePosition.min.y)
            .attr('width', (r) => r.spritePosition.size.x)
            .attr('height', (r) => r.spritePosition.size.y)
            .attr('class', 'svg-room')
            .attr('mask', (r) => 'url(#mask_' + componentId + '_' + r.spriteInfo.name + ')')

            .style('fill', (r) => r.color.formatHex())
            .style('pointer-events', 'all')
            .on('mouseover', (event: PointerEvent, r) => {
                onMouseOverEvent(event, r);
            })
            .on('click', (event: PointerEvent, r) => {
                onClickEvent(event, r);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, mainEffectDependencies);

    useEffect(() => {
        roomRects.current?.style('fill', (r) => roomColoring.getRoomColor(r));
    }, [
        // eslint-disable-next-line react-hooks/exhaustive-deps
        ...mainEffectDependencies,
        roomColoring,
    ]);
}
