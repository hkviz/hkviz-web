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
}

export function useMapTraces({ useViewOptionsStore, animatedTraceG }: Props) {
    const animatedTraceChunks = useRef<
        {
            minMsIntoGame: number;
            maxMsIntoGame: number;
            group: d3.Selection<SVGGElement, unknown, null, undefined>;
            lines: d3.Selection<SVGLineElement, PlayerPositionEvent, SVGGElement, unknown>;
        }[]
    >();

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
            console.log(chunkEvents);

            const lines = chunkGroup
                .selectAll('line')
                .data(chunkEvents)
                .enter()
                .append('line')
                .attr('x1', (d) => d.previousPlayerPositionEventWithMapPosition!.mapPosition!.x)
                .attr('y1', (d) => d.previousPlayerPositionEventWithMapPosition!.mapPosition!.y)
                .attr('x2', (d) => d.mapPosition!.x)
                .attr('y2', (d) => d.mapPosition!.y)
                .attr('stroke-width', 0.05 * SCALE_FACTOR)
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
        const minMsIntoGame = animationMsIntoGame - traceAnimationLengthMs;
        const maxMsIntoGame = animationMsIntoGame;

        animatedTraceChunks.current?.forEach((chunk) => {
            const hidden = chunk.minMsIntoGame > maxMsIntoGame || chunk.maxMsIntoGame < minMsIntoGame;
            if (hidden) {
                chunk.group.attr('visibility', 'hidden');
            } else {
                chunk.group.attr('visibility', 'visible');
                chunk.lines.attr('stroke-opacity', (d) => {
                    const msIntoGame = d.msIntoGame;
                    if (traceVisibility === 'all') return 1;
                    if (traceVisibility === 'hide') return 0;
                    if (msIntoGame > animationMsIntoGame) return 0;
                    if (msIntoGame < animationMsIntoGame - traceAnimationLengthMs) return 0;

                    const opacity = 1 - (animationMsIntoGame - msIntoGame) / traceAnimationLengthMs;
                    return opacity;
                });
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
