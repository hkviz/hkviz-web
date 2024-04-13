import Image from 'next/image';
import { useEffect, useRef, type MutableRefObject, type RefObject } from 'react';
import useEvent from 'react-use-event-hook';
import { type UseViewOptionsStore } from '~/app/run/[id]/_viewOptionsStore';
import { binarySearchLastIndexBefore } from '~/lib/utils/binary-search';
import { assertNever } from '~/lib/utils/utils';
import knightPinSrc from '../../../../public/ingame-sprites/Map_Knight_Pin_Compass.png';
import shadePinSrc from '../../../../public/ingame-sprites/pin/Shade_Pin.png';
import { mapVisualExtends } from '../map-data/map-extends';
import { playerPositionToMapPosition } from '../map-data/player-position';
import { scale } from '../map-data/scaling';
import { type PlayerPositionEvent } from '../recording-files/events/player-position-event';
import { Vector2 } from '../types/vector2';

export interface HKMapTracesProps {
    useViewOptionsStore: UseViewOptionsStore;
    containerRef: RefObject<HTMLDivElement>;
    zoomHandler: MutableRefObject<((event: any) => void) | undefined>;
}

const EMPTY_ARRAY = [] as const;

export function HKMapTraces({ useViewOptionsStore, containerRef, zoomHandler }: HKMapTracesProps) {
    const isV1 = useViewOptionsStore((s) => s.isV1());
    const zoomPosition = useRef({ offsetX: 0, offsetY: 0, scale: 1 });
    const canvasSizeInUnits = useRef({ width: 0, height: 0, pixelRatio: 1 });
    const recording = useViewOptionsStore((s) => s.recording);
    const knightPinImage = useRef<HTMLImageElement>(null);
    const shadePinImage = useRef<HTMLImageElement>(null);

    const positionEvents: readonly PlayerPositionEvent[] =
        recording?.playerPositionEventsWithTracePosition ?? EMPTY_ARRAY;

    const canvas = useRef<HTMLCanvasElement>(null);

    const draw = useEvent(() => {
        if (!canvas.current || isV1) return;

        // scaling
        const boundsAspectRatio = mapVisualExtends.size.x / mapVisualExtends.size.y;
        const canvasAspectRatio = canvasSizeInUnits.current.width / canvasSizeInUnits.current.height;

        const mapDistanceToCanvasUnits =
            boundsAspectRatio > canvasAspectRatio
                ? canvasSizeInUnits.current.width / mapVisualExtends.size.x
                : canvasSizeInUnits.current.height / mapVisualExtends.size.y;

        const scaler = zoomPosition.current.scale * mapDistanceToCanvasUnits;

        const xOffset =
            canvasSizeInUnits.current.width / 2 -
            mapVisualExtends.center.x * mapDistanceToCanvasUnits +
            zoomPosition.current.offsetX * mapDistanceToCanvasUnits;
        const yOffset =
            canvasSizeInUnits.current.height / 2 -
            mapVisualExtends.center.y * mapDistanceToCanvasUnits +
            zoomPosition.current.offsetY * mapDistanceToCanvasUnits;
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
            storeValue.traceVisibility === 'animated' &&
            positionEvents.length > 0 &&
            minMsIntoGame > positionEvents[0]!.msIntoGame
                ? binarySearchLastIndexBefore(positionEvents, minMsIntoGame, (v) => v.msIntoGame)
                : 0;

        const ctx = canvas.current.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvasSizeInUnits.current.width, canvasSizeInUnits.current.height);

        if (storeValue.traceVisibility === 'hide' || firstIndex === -1) return;

        ctx.fillStyle = 'transparent';
        // using sqrt so the line becomes thicker when zooming in, but not at the same speed
        // as everything else grows.
        const baseLineWidth = mapDistanceToCanvasUnits * zoomPosition.current.scale ** 0.5;

        let i = firstIndex;
        let event = positionEvents[i];
        let previousEvent = null;
        if (!event) return;
        ctx.strokeStyle = `rgb(225 29 72/1)`; // tailwind rose-600
        const dashArray = [baseLineWidth * 1, baseLineWidth * 2];

        while (event && (storeValue.traceVisibility === 'all' || event.msIntoGame <= maxMsIntoGame)) {
            if (previousEvent) {
                const opacity =
                    storeValue.traceVisibility === 'animated'
                        ? 1 - (maxMsIntoGame - event.msIntoGame) / storeValue.traceAnimationLengthMs
                        : 1;

                ctx.globalAlpha = opacity ** 0.5; // fade out slower
                ctx.beginPath();
                const isJump = (event.mapDistanceToPrevious ?? 0) > scale(1.5);
                ctx.setLineDash(isJump ? dashArray : EMPTY_ARRAY);
                ctx.lineWidth = isJump ? baseLineWidth / 2 : baseLineWidth;

                ctx.moveTo(x(previousEvent.mapPosition!.x), y(previousEvent.mapPosition!.y));
                ctx.lineTo(x(event.mapPosition!.x), y(event.mapPosition!.y));
                ctx.stroke();
                ctx.closePath();
            }

            i++;
            previousEvent = event;
            event = positionEvents[i];
        }

        // shade pin
        const frameEvent = recording?.frameEndEventFromMs(storeValue.animationMsIntoGame);
        if (storeValue.traceVisibility === 'animated' && recording && frameEvent && frameEvent.shadeScene != 'None') {
            const mapPosition = playerPositionToMapPosition(
                new Vector2(frameEvent.shadePositionX, frameEvent.shadePositionY),
                recording.sceneEvents.find((it) => it.sceneName === frameEvent.shadeScene)!,
            );
            if (mapPosition) {
                const shadePin = shadePinImage.current!;
                const shadePinSize = baseLineWidth * 12;
                ctx.shadowColor = 'rgba(255,255,255,0.6)';
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.shadowBlur = baseLineWidth * 4;
                ctx.drawImage(
                    shadePin,
                    x(mapPosition.x) - 0.5 * shadePinSize,
                    y(mapPosition.y) - 0.5 * shadePinSize,
                    shadePinSize,
                    shadePinSize,
                );
                ctx.shadowBlur = 0;
            }
        }

        // knight pin
        if (
            storeValue.traceVisibility === 'animated' &&
            previousEvent &&
            previousEvent.msIntoGame + 30000 >= maxMsIntoGame // 15000
        ) {
            const knightPin = knightPinImage.current!;
            const knightPinSize = baseLineWidth * 15;
            ctx.drawImage(
                knightPin,
                x(previousEvent.mapPosition!.x) - 0.5 * knightPinSize,
                y(previousEvent.mapPosition!.y) - 0.5 * knightPinSize,
                knightPinSize,
                knightPinSize,
            );
        }
    });

    useEffect(() => {
        function containerSizeChanged() {
            if (!canvas.current || !containerRef.current) return;

            canvasSizeInUnits.current.width = containerRef.current.offsetWidth;
            canvasSizeInUnits.current.height = containerRef.current.offsetHeight;
            canvasSizeInUnits.current.pixelRatio = window.devicePixelRatio;

            canvas.current.width = containerRef.current.offsetWidth * canvasSizeInUnits.current.pixelRatio;
            canvas.current.height = containerRef.current.offsetHeight * canvasSizeInUnits.current.pixelRatio;
            const ctx = canvas.current.getContext('2d')!;
            ctx.scale(canvasSizeInUnits.current.pixelRatio, canvasSizeInUnits.current.pixelRatio);

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

    useEffect(() => {
        draw();
    }, [draw, positionEvents]);

    return (
        <>
            <Image src={knightPinSrc} alt="knight pin" className="hidden" ref={knightPinImage} loading="eager" />
            <Image src={shadePinSrc} alt="shade pin" className="hidden" ref={shadePinImage} loading="eager" />
            <canvas ref={canvas} className="pointer-events-none absolute inset-0 h-full w-full" />
        </>
    );
}
