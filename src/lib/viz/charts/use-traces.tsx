import { useEffect, useRef } from 'react';
import { PlayerPositionEvent } from '../recording-files/recording';
import type { UseViewOptionsStore } from '~/app/run/[id]/_viewOptionsStore';

interface Props {
    useViewOptionsStore: UseViewOptionsStore;
}

export function useMapTraces({ useViewOptionsStore }: Props) {
    const animatedTraceG = useRef<d3.Selection<SVGGElement, unknown, null, undefined>>();
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
                event.previousPlayerPositionEvent != null &&
                event.sceneEvent.originOffset != null &&
                event.previousPlayerPositionEvent.sceneEvent.originOffset != null
            );
        });
        animatedTraceG.current!.selectAll('path').remove();

        animatedTracePaths.current = animatedTraceG
            .current!.selectAll('line')
            .data(positionEvents)
            .enter()
            .append('path')
            .attr('d', (d) =>
                d3.line()([
                    playerPositionToMapPosition(
                        d.previousPlayerPositionEvent!.position,
                        d.previousPlayerPositionEvent!.sceneEvent,
                    )!.toD3(),
                    playerPositionToMapPosition(d.position, d.sceneEvent)!.toD3(),
                ]),
            )
            .attr('stroke-width', 0.05 * SCALE_FACTOR)
            .attr('stroke-linecap', 'round')
            .attr('stroke', 'red')
            .attr('fill', 'none');
    }, [recording]);

    useEffect(() => {
        animatedTracePaths.current?.attr('stroke-opacity', (d) => {
            const msIntoGame = d.msIntoGame;
            if (traceVisibility === 'all') return 1;
            if (traceVisibility === 'hide') return 0;
            if (msIntoGame > animationMsIntoGame) return 0;
            if (msIntoGame <= animationMsIntoGame - traceAnimationLengthMs) return 0;

            const opacity = 1 - (animationMsIntoGame - msIntoGame) / traceAnimationLengthMs;
            return opacity;
        });
    }, [recording, animationMsIntoGame, traceAnimationLengthMs, traceVisibility]);
}
