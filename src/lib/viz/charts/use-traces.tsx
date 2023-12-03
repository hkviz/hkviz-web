import * as d3 from 'd3';
import { RefObject, useEffect, useRef } from 'react';
import { UseViewOptionsStore } from '~/app/run/[id]/_viewOptionsStore';
import { SCALE_FACTOR } from '../map-data/rooms';
import { PlayerPositionEvent } from '../recording-files/recording';

function chunk<T>(arr: T[], chunkSize: number) {
    const chunks: T[][] = [];
    const length = arr.length;
    for (let i = 0; i < length; i += chunkSize) {
        chunks.push(arr.slice(i, i + chunkSize));
    }
    return chunks;
}

interface Props {
    useViewOptionsStore: UseViewOptionsStore;
    animatedTraceG: RefObject<d3.Selection<SVGGElement, unknown, null, undefined> | undefined>;
    knightPinG: RefObject<d3.Selection<SVGGElement, unknown, null, undefined> | undefined>;
}

const SCALED_LINE_WIDTH = 0.05 * SCALE_FACTOR;
const SCALED_KNIGHT_PIN_SIZE = 0.75 * SCALE_FACTOR;

export function useMapTraces({ useViewOptionsStore, animatedTraceG, knightPinG }: Props) {
    const animatedTraceChunks = useRef<
        {
            minMsIntoGame: number;
            maxMsIntoGame: number;
            group: d3.Selection<SVGGElement, unknown, null, undefined>;
            lines: d3.Selection<SVGLineElement, PlayerPositionEvent, SVGGElement, unknown>;
        }[]
    >();
    const knightPin = useRef<d3.Selection<SVGImageElement, unknown, null, undefined> | undefined>();

    const animationMsIntoGame = useViewOptionsStore((s) => s.animationMsIntoGame);
    const traceAnimationLengthMs = useViewOptionsStore((s) => s.traceAnimationLengthMs);
    const traceVisibility = useViewOptionsStore((s) => s.traceVisibility);
    const recording = useViewOptionsStore((s) => s.recording);

    useEffect(() => {
        if (!recording) return;

        const positionEvents = recording.events.filter((event): event is PlayerPositionEvent => {
            return (
                event instanceof PlayerPositionEvent &&
                event.mapPosition != null &&
                event.previousPlayerPositionEventWithMapPosition?.mapPosition != null
            );
        });

        const positionEventChunks = chunk(positionEvents, 100);
        animatedTraceChunks.current?.forEach((chunk) => chunk.group.remove());

        animatedTraceChunks.current = positionEventChunks.map((chunkEvents, i) => {
            const chunkGroup = animatedTraceG
                .current!.append('g')
                .attr('data-group', 'animated-trace-chunk')
                .attr('data-chunk-index', i);

            const lines = chunkGroup
                .selectAll('line')
                .data(chunkEvents)
                .enter()
                .append('line')
                .attr('x1', (d) =>
                    d.mapPosition!.equals(d.previousPlayerPositionEventWithMapPosition!.mapPosition!)
                        ? d.mapPosition!.x - SCALED_LINE_WIDTH / 2
                        : d.previousPlayerPositionEventWithMapPosition!.mapPosition!.x,
                )
                .attr('y1', (d) => d.previousPlayerPositionEventWithMapPosition!.mapPosition!.y)
                .attr('x2', (d) =>
                    d.mapPosition!.equals(d.previousPlayerPositionEventWithMapPosition!.mapPosition!)
                        ? d.mapPosition!.x + SCALED_LINE_WIDTH / 2
                        : d.mapPosition!.x,
                )
                .attr('y2', (d) => d.mapPosition!.y)
                .attr('stroke-width', SCALED_LINE_WIDTH)
                // .attr('stroke-linecap', 'round')
                // .attr('stroke', 'red')
                .attr('class', 'text-rose-600 stroke-current')
                .attr('fill', 'none')
                .attr('data-ms-into-game', (d) => d.msIntoGame);

            return {
                minMsIntoGame: chunkEvents[0]!.msIntoGame,
                maxMsIntoGame: chunkEvents[chunkEvents.length - 1]!.msIntoGame,
                group: chunkGroup,
                lines,
            };
        });
        console.log(animatedTraceChunks.current);

        animatedTraceG.current!.selectAll('path').remove();
    }, [recording, animatedTraceG]);

    useEffect(() => {
        knightPin.current = knightPinG
            .current!.append('image')
            .attr('xlink:href', '/ingame-sprites/Map_Knight_Pin_Compass.png')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', SCALED_KNIGHT_PIN_SIZE)
            .attr('height', SCALED_KNIGHT_PIN_SIZE)
            .attr('preserveAspectRatio', 'none');
    }, [knightPinG]);

    useEffect(() => {
        const minMsIntoGame = animationMsIntoGame - traceAnimationLengthMs;
        const maxMsIntoGame = animationMsIntoGame;

        let newestPositionEvent: PlayerPositionEvent | undefined;

        animatedTraceChunks.current?.forEach((chunk) => {
            const hidden =
                traceVisibility !== 'all' &&
                (traceVisibility === 'hide' ||
                    chunk.minMsIntoGame > maxMsIntoGame ||
                    chunk.maxMsIntoGame < minMsIntoGame);

            if (hidden) {
                chunk.group.attr('visibility', 'hidden');
            } else {
                chunk.group.attr('visibility', 'visible');
                chunk.lines.attr('stroke-opacity', (d) => {
                    const msIntoGame = d.msIntoGame;
                    if (traceVisibility === 'all') return 1;
                    if (msIntoGame > animationMsIntoGame) return 0;
                    if (msIntoGame < animationMsIntoGame - traceAnimationLengthMs) return 0;

                    newestPositionEvent = d;

                    const opacity = 1 - (animationMsIntoGame - msIntoGame) / traceAnimationLengthMs;
                    return opacity;
                });
            }

            if (newestPositionEvent) {
                knightPin
                    .current!.attr('x', newestPositionEvent.mapPosition!.x - 0.5 * SCALED_KNIGHT_PIN_SIZE)
                    // slightly off center, since knight pin is visually a bit below center of the sprite
                    .attr('y', newestPositionEvent.mapPosition!.y - 0.5 * SCALED_KNIGHT_PIN_SIZE - 0.1 * SCALE_FACTOR)
                    .attr('visibility', 'visible');
            } else {
                knightPin.current?.attr('visibility', 'hidden');
            }
        });
    }, [recording, animationMsIntoGame, traceAnimationLengthMs, traceVisibility]);

    // useEffect(() => {
    //     animatedTracePaths.current?.attr('stroke-opacity', (d) => {
    //         const msIntoGame = d.msIntoGame;
    //         if (traceVisibility === 'all') return 1;
    //         if (traceVisibility === 'hide') return 0;
    //         if (msIntoGame > animationMsIntoGame) return 0;
    //         if (msIntoGame < animationMsIntoGame - traceAnimationLengthMs) return 0;

    //         const opacity = 1 - (animationMsIntoGame - msIntoGame) / traceAnimationLengthMs;
    //         return opacity;
    //     });
    // }, [recording, animationMsIntoGame, traceAnimationLengthMs, traceVisibility]);
}
