import { PlayerPositionEvent, SCALE_FACTOR, scale } from '@hkviz/parser';
import { useSignals } from '@preact/signals-react/runtime';
import type * as d3 from 'd3';
import { useEffect, useRef, type RefObject } from 'react';
import { animationStore } from '~/lib/stores/animation-store';
import { gameplayStore } from '~/lib/stores/gameplay-store';
import { traceStore } from '~/lib/stores/trace-store';
import { uiStore } from '~/lib/stores/ui-store';

function chunk<T>(arr: T[], chunkSize: number) {
    const chunks: T[][] = [];
    const length = arr.length;
    for (let i = 0; i < length; i += chunkSize) {
        chunks.push(arr.slice(i, i + chunkSize));
    }
    return chunks;
}

interface Props {
    animatedTraceG: RefObject<d3.Selection<SVGGElement, unknown, null, undefined> | undefined>;
    knightPinG: RefObject<d3.Selection<SVGGElement, unknown, null, undefined> | undefined>;
}

const SCALED_LINE_WIDTH = scale(0.05);
const SCALED_KNIGHT_PIN_SIZE = scale(0.75);

export function useMapTraces({ animatedTraceG, knightPinG }: Props) {
    useSignals();
    const animatedTraceChunks = useRef<
        {
            minMsIntoGame: number;
            maxMsIntoGame: number;
            group: d3.Selection<SVGGElement, unknown, null, undefined>;
            lines: d3.Selection<SVGLineElement, PlayerPositionEvent, SVGGElement, unknown>;
        }[]
    >();
    const knightPin = useRef<d3.Selection<SVGImageElement, unknown, null, undefined> | undefined>();

    const animationMsIntoGame = animationStore.msIntoGame.valuePreact;
    const traceAnimationLengthMs = traceStore.lengthMs.value;
    const traceVisibility = traceStore.visibility.value;
    const recording = gameplayStore.recording.valuePreact;
    const isV1 = uiStore.isV1.value;

    // always 0 when traceVisibility !== 'animated' since that avoids running the effect when animating, but traces are not animating
    const animationMsIntoGameForTrace = traceVisibility === 'animated' ? animationMsIntoGame : 0;

    useEffect(() => {
        if (!recording) return;

        const positionEvents = isV1
            ? recording.events.filter((event): event is PlayerPositionEvent => {
                  return (
                      event instanceof PlayerPositionEvent &&
                      event.mapPosition != null &&
                      event.previousPlayerPositionEventWithMapPosition?.mapPosition != null &&
                      !event.previousPlayerPositionEventWithMapPosition.mapPosition.equals(event.mapPosition)
                  );
              })
            : [];

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
                .style('pointer-events', 'none')
                .attr(
                    'x1',
                    (d) => d.previousPlayerPositionEventWithMapPosition!.mapPosition!.x,
                    // d.mapPosition!.equals(d.previousPlayerPositionEventWithMapPosition!.mapPosition!)
                    //     ? d.mapPosition!.x - SCALED_LINE_WIDTH / 2
                    //     : d.previousPlayerPositionEventWithMapPosition!.mapPosition!.x,
                )
                .attr('y1', (d) => d.previousPlayerPositionEventWithMapPosition!.mapPosition!.y)
                .attr(
                    'x2',
                    (d) => d.mapPosition!.x,
                    // d.mapPosition!.equals(d.previousPlayerPositionEventWithMapPosition!.mapPosition!)
                    //     ? d.mapPosition!.x + SCALED_LINE_WIDTH / 2
                    //     : d.mapPosition!.x,
                )
                .attr('y2', (d) => d.mapPosition!.y)
                .attr('stroke-width', SCALED_LINE_WIDTH)
                // .attr('stroke-linecap', 'round')
                // .attr('stroke', 'red')
                .attr('class', 'text-rose-600 stroke-current')
                .attr('fill', 'none')
                .attr('data-ms-into-game', (d) => d.msIntoGame)
                .style('stroke-dasharray', (d) =>
                    d.mapDistanceToPrevious != null && d.mapDistanceToPrevious > 1 * SCALE_FACTOR ? '1, 1' : 'none',
                );

            return {
                minMsIntoGame: chunkEvents[0]!.msIntoGame,
                maxMsIntoGame: chunkEvents[chunkEvents.length - 1]!.msIntoGame,
                group: chunkGroup,
                lines,
            };
        });

        animatedTraceG.current!.selectAll('path').remove();
    }, [recording, animatedTraceG, isV1]);

    useEffect(() => {
        knightPin.current = knightPinG
            .current!.append('image')
            .attr('xlink:href', '/ingame-sprites/Map_Knight_Pin_Compass.png')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', SCALED_KNIGHT_PIN_SIZE)
            .attr('height', SCALED_KNIGHT_PIN_SIZE)
            .attr('preserveAspectRatio', 'none')
            .style('pointer-events', 'none')
            .attr('visibility', 'hidden');
    }, [knightPinG]);

    useEffect(() => {
        const minMsIntoGame = animationMsIntoGameForTrace - traceAnimationLengthMs;
        const maxMsIntoGame = animationMsIntoGameForTrace;

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
                    if (msIntoGame > animationMsIntoGameForTrace) return 0;
                    if (msIntoGame < animationMsIntoGameForTrace - traceAnimationLengthMs) return 0;

                    newestPositionEvent = d;

                    const opacity = 1 - (animationMsIntoGameForTrace - msIntoGame) / traceAnimationLengthMs;
                    return opacity;
                });
            }

            if (newestPositionEvent && newestPositionEvent.msIntoGame + 15000 >= animationMsIntoGameForTrace) {
                knightPin
                    .current!.attr('x', newestPositionEvent.mapPosition!.x - 0.5 * SCALED_KNIGHT_PIN_SIZE)
                    // slightly off center, since knight pin is visually a bit below center of the sprite
                    .attr('y', newestPositionEvent.mapPosition!.y - 0.5 * SCALED_KNIGHT_PIN_SIZE - scale(0.1))
                    .attr('visibility', 'visible');
            } else {
                knightPin.current?.attr('visibility', 'hidden');
            }
        });
    }, [recording, animationMsIntoGameForTrace, traceAnimationLengthMs, traceVisibility]);

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
