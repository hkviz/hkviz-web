import { useEffect, useMemo, useRef, type MutableRefObject, type RefObject } from 'react';
import useEvent from 'react-use-event-hook';
import { type UseViewOptionsStore } from '~/app/run/[id]/_viewOptionsStore';
import { assertNever } from '~/lib/utils/utils';
import { mapVisualExtends } from '../map-data/map-extends';
import { PlayerPositionEvent } from '../recording-files/events/player-position-event';

export interface HKMapTracesProps {
    useViewOptionsStore: UseViewOptionsStore;
    containerRef: RefObject<HTMLDivElement>;
    zoomHandler: MutableRefObject<((event: any) => void) | undefined>;
}

const EMPTY_ARRAY = [] as const;

function binarySearchLastIndexBefore<T>(arr: readonly T[], value: number, getValue: (v: T) => number): number {
    let low = 0;
    let high = arr.length - 1;
    while (low <= high) {
        const mid = (low + high) >>> 1;
        const midValue = getValue(arr[mid]!);
        if (midValue <= value) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return high;
}

export function HKMapTraces({ useViewOptionsStore, containerRef, zoomHandler }: HKMapTracesProps) {
    const zoomPosition = useRef({ offsetX: 0, offsetY: 0, scale: 1 });
    const animationMsIntoGame = useViewOptionsStore((s) => s.animationMsIntoGame);
    const traceAnimationLengthMs = useViewOptionsStore((s) => s.traceAnimationLengthMs);
    const traceVisibility = useViewOptionsStore((s) => s.traceVisibility);
    const recording = useViewOptionsStore((s) => s.recording);

    // always 0 when traceVisibility !== 'animated' since that avoids running the effect when animating, but traces are not animating
    const animationMsIntoGameForTrace = traceVisibility === 'animated' ? animationMsIntoGame : 0;

    const positionEvents: readonly PlayerPositionEvent[] = useMemo(() => {
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

        // scaling
        const boundsAspectRatio = mapVisualExtends.size.x / mapVisualExtends.size.y;
        const canvasAspectRatio = canvas.current.width / canvas.current.height;

        const mapDistanceToPixels =
            boundsAspectRatio > canvasAspectRatio
                ? canvas.current.width / mapVisualExtends.size.x
                : canvas.current.height / mapVisualExtends.size.y;

        const scaler = zoomPosition.current.scale * mapDistanceToPixels;

        const xOffset =
            canvas.current.width / 2 -
            mapVisualExtends.center.x * mapDistanceToPixels +
            zoomPosition.current.offsetX * mapDistanceToPixels;
        const yOffset =
            canvas.current.height / 2 -
            mapVisualExtends.center.y * mapDistanceToPixels +
            zoomPosition.current.offsetY * mapDistanceToPixels;
        function x(v: number) {
            return v * scaler + xOffset;
        }
        function y(v: number) {
            return v * scaler + yOffset;
        }

        // animation
        const storeValue = useViewOptionsStore.getState();
        const minMsIntoGame = storeValue.animationMsIntoGame - storeValue.traceAnimationLengthMs;
        const maxMsIntoGame = storeValue.animationMsIntoGame;

        const firstIndex =
            storeValue.traceVisibility === 'animated'
                ? binarySearchLastIndexBefore(positionEvents, minMsIntoGame, (v) => v.msIntoGame)
                : 0;

        const ctx = canvas.current.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);

        if (traceVisibility === 'hide' || firstIndex === -1) return;

        ctx.fillStyle = 'transparent';
        // using sqrt so the line becomes thicker when zooming in, but not at the same speed
        // as everything else grows.
        const baseLineWidth =
            mapDistanceToPixels * Math.min(zoomPosition.current.scale ** 0.5, zoomPosition.current.scale);
        ctx.lineWidth = baseLineWidth;

        let i = firstIndex;
        let event = positionEvents[i];
        let previousEvent = null;
        if (!event) return;
        ctx.strokeStyle = `rgb(225 29 72/1)`; // tailwind rose-600

        while (event && event.msIntoGame <= maxMsIntoGame) {
            if (previousEvent) {
                const opacity =
                    traceVisibility === 'animated'
                        ? 1 - (maxMsIntoGame - event.msIntoGame) / traceAnimationLengthMs
                        : 1;

                ctx.globalAlpha = opacity ** 0.5; // fade out slower
                ctx.beginPath();
                ctx.moveTo(x(previousEvent.mapPosition!.x), y(previousEvent.mapPosition!.y));
                ctx.lineTo(x(event.mapPosition!.x), y(event.mapPosition!.y));
                ctx.stroke();
                ctx.closePath();
            }

            i++;
            previousEvent = event;
            event = positionEvents[i];
        }
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

    useEffect(() => {
        return useViewOptionsStore.subscribe(
            (s) => {
                switch (s.traceVisibility) {
                    // different for hide and all, so rendering still triggers when changing visibility
                    case 'hide':
                        return -2;
                    case 'all':
                        return -1;
                    case 'animated':
                        return s.animationMsIntoGame;
                    default:
                        assertNever(s.traceVisibility);
                }
            },
            () => {
                draw();
            },
            { fireImmediately: true },
        );
    }, [draw, useViewOptionsStore]);

    return <canvas ref={canvas} className="pointer-events-none absolute inset-0" />;
}
