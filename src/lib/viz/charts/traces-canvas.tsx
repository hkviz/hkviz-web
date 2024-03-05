import { useEffect, useMemo, useRef, type MutableRefObject, type RefObject } from 'react';
import useEvent from 'react-use-event-hook';
import { type UseViewOptionsStore } from '~/app/run/[id]/_viewOptionsStore';
import { mapVisualExtends } from '../map-data/map-extends';
import { PlayerPositionEvent } from '../recording-files/events/player-position-event';

export interface HKMapTracesProps {
    useViewOptionsStore: UseViewOptionsStore;
    containerRef: RefObject<HTMLDivElement>;
    zoomHandler: MutableRefObject<((event: any) => void) | undefined>;
}

const EMPTY_ARRAY = [] as const;

export function HKMapTraces({ useViewOptionsStore, containerRef, zoomHandler }: HKMapTracesProps) {
    const zoomPosition = useRef({ offsetX: 0, offsetY: 0, scale: 1 });
    const animationMsIntoGame = useViewOptionsStore((s) => s.animationMsIntoGame);
    const traceAnimationLengthMs = useViewOptionsStore((s) => s.traceAnimationLengthMs);
    const traceVisibility = useViewOptionsStore((s) => s.traceVisibility);
    const recording = useViewOptionsStore((s) => s.recording);

    // always 0 when traceVisibility !== 'animated' since that avoids running the effect when animating, but traces are not animating
    const animationMsIntoGameForTrace = traceVisibility === 'animated' ? animationMsIntoGame : 0;

    const positionEvents = useMemo(() => {
        if (!recording) return EMPTY_ARRAY;

        return recording.events.filter((event): event is PlayerPositionEvent => {
            return (
                event instanceof PlayerPositionEvent &&
                event.mapPosition != null &&
                event.previousPlayerPositionEventWithMapPosition?.mapPosition != null &&
                !event.previousPlayerPositionEventWithMapPosition.mapPosition.equals(event.mapPosition)
            );
        });
    }, [recording]);

    const canvas = useRef<HTMLCanvasElement>(null);

    const draw = useEvent(() => {
        if (!canvas.current) return;
        const xScale = (zoomPosition.current.scale * canvas.current.width) / mapVisualExtends.size.x;

        const yScale = (zoomPosition.current.scale * canvas.current.height) / mapVisualExtends.size.y;

        const xOffset = -mapVisualExtends.min.x + zoomPosition.current.offsetX;
        const yOffset = -mapVisualExtends.min.y + zoomPosition.current.offsetY;
        function x(v: number) {
            return v * xScale + xOffset;
        }
        function y(v: number) {
            return v * yScale + yOffset;
        }

        const ctx = canvas.current.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);

        ctx.fillStyle = 'red';
        ctx.strokeStyle = 'red';

        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (const event of positionEvents) {
            ctx.lineTo(x(event.mapPosition!.x), y(event.mapPosition!.y));
        }
        ctx.stroke();
    });

    useEffect(() => {
        function containerSizeChanged() {
            if (!canvas.current || !containerRef.current) return;

            canvas.current.width = containerRef.current.offsetWidth;
            canvas.current.height = containerRef.current.offsetHeight;

            // canvas.current
            //     .attr('width', containerRef.current.offsetWidth)
            //     .attr('height', containerRef.current.offsetHeight);
            draw();
        }
        containerSizeChanged();

        const resizeObserver = new ResizeObserver(containerSizeChanged);

        resizeObserver.observe(containerRef.current!);

        return () => {
            resizeObserver.disconnect();
        };
    }, [containerRef, draw]);

    useEffect(() => {
        zoomHandler.current = (event) => {
            zoomPosition.current = {
                offsetX: event.transform.x,
                offsetY: event.transform.y,
                scale: event.transform.k,
            };
            draw();
        };
    }, [draw, zoomHandler]);

    return <canvas ref={canvas} className="pointer-events-none absolute inset-0" />;
}
