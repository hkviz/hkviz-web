import { RefObject, useEffect, useId } from 'react';
import { type RoomInfo } from '../map-data/rooms';
import useEvent from 'react-use-event-hook';

export function useMapRooms(
    {
        roomDataEnter,
        onClick = () => undefined,
        onMouseOver = () => undefined,
    }: {
        roomDataEnter: RefObject<d3.Selection<d3.EnterElement, RoomInfo, SVGGElement, unknown> | undefined>;
        onClick?: (event: PointerEvent, r: RoomInfo) => void;
        onMouseOver?: (event: PointerEvent, r: RoomInfo) => void;
    },
    dependencies: unknown[],
) {
    const onMouseOverEvent = useEvent(onMouseOver);
    const onClickEvent = useEvent(onClick);
    const componentId = useId();

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
        roomGs
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
    }, [componentId, onClickEvent, onMouseOverEvent, roomDataEnter, ...dependencies]);
}
