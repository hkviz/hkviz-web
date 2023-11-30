import * as d3 from 'd3';
import { RefObject, useEffect, useRef } from 'react';
import { UseViewOptionsStore } from '~/app/run/[id]/_viewOptionsStore';
import { SCALE_FACTOR } from '../map-data/rooms';
import { PlayerPositionEvent } from '../recording-files/recording';

interface Props {
    useViewOptionsStore: UseViewOptionsStore;
    animatedTraceG: RefObject<d3.Selection<SVGGElement, unknown, null, undefined> | undefined>;
}

export function useMapTraces({ useViewOptionsStore, animatedTraceG }: Props) {
    const animatedTracePaths = useRef<d3.Selection<SVGPathElement, PlayerPositionEvent, SVGGElement, unknown>>();

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
        animatedTraceG.current!.selectAll('path').remove();

        animatedTracePaths.current = animatedTraceG
            .current!.selectAll('line')
            .data(positionEvents)
            .enter()
            .append('path')
            .attr('d', (d) => {
                return d3.line()([
                    d.previousPlayerPositionEventWithMapPosition!.mapPosition!.toD3(),
                    d.mapPosition!.toD3(),
                ]);
            })
            .attr('stroke-width', 0.05 * SCALE_FACTOR)
            // .attr('stroke-linecap', 'round')
            // .attr('stroke', 'red')
            .attr('class', 'text-rose-600 stroke-current')
            .attr('fill', 'none')
            .attr('data-ms-into-game', (d) => d.msIntoGame);
    }, [recording, animatedTraceG]);

    useEffect(() => {
        animatedTracePaths.current?.attr('stroke-opacity', (d) => {
            const msIntoGame = d.msIntoGame;
            if (traceVisibility === 'all') return 1;
            if (traceVisibility === 'hide') return 0;
            if (msIntoGame > animationMsIntoGame) return 0;
            if (msIntoGame < animationMsIntoGame - traceAnimationLengthMs) return 0;

            const opacity = 1 - (animationMsIntoGame - msIntoGame) / traceAnimationLengthMs;
            return opacity;
        });
    }, [recording, animationMsIntoGame, traceAnimationLengthMs, traceVisibility]);
}
