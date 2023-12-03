import { type RoomInfo } from '../map-data/rooms';

type PreserveAspectRatio =
    | 'none'
    | 'xMinYMin'
    | 'xMidYMin'
    | 'xMaxYMin'
    | 'xMinYMid'
    | 'xMidYMid'
    | 'xMaxYMid'
    | 'xMinYMax'
    | 'xMidYMax'
    | 'xMaxYMax';

export function makeD3MapRoom({
    roomDataEnter,
    onClick,
    onMouseOver,
    componentId,
    preserveAspectRatio = 'xMidYMid',
}: {
    roomDataEnter: d3.Selection<d3.EnterElement, RoomInfo, SVGGElement, unknown>;
    onClick?: (event: PointerEvent, r: RoomInfo) => void;
    onMouseOver?: (event: PointerEvent, r: RoomInfo) => void;
    componentId: string;
    preserveAspectRatio?: PreserveAspectRatio;
}) {
    const roomGs = roomDataEnter.append('svg:g').attr('data-scene-name', (r) => r.sceneName);

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
        .attr('preserveAspectRatio', preserveAspectRatio)
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
            onMouseOver?.(event, r);
        })
        .on('click', (event: PointerEvent, r) => {
            onClick?.(event, r);
        });
}
