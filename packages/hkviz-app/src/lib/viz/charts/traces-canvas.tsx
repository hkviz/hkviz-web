import { useSignal, useSignalEffect } from '@preact/signals-react';
import { useSignals } from '@preact/signals-react/runtime';
import Image from 'next/image';
import { type MutableRefObject, type RefObject } from 'react';
import { animationStore } from '~/lib/stores/animation-store';
import { gameplayStore } from '~/lib/stores/gameplay-store';
import { traceStore } from '~/lib/stores/trace-store';
import { uiStore } from '~/lib/stores/ui-store';
import { binarySearchLastIndexBefore } from '~/lib/utils/binary-search';
import { useAutoSizeCanvas } from '~/lib/utils/canvas';
import { signalRef } from '~/lib/utils/signal-ref';
import knightPinSrc from '../../../../public/ingame-sprites/Map_Knight_Pin_Compass.png';
import shadePinSrc from '../../../../public/ingame-sprites/pin/Shade_Pin.png';
import { mapVisualExtends } from '../map-data/map-extends';
import { playerPositionToMapPosition } from '../map-data/player-position';
import { scale } from '../map-data/scaling';
import { Vector2 } from '../types/vector2';

export interface HKMapTracesProps {
    containerRef: RefObject<HTMLDivElement>;
    zoomHandler: MutableRefObject<((event: any) => void) | undefined>;
}

const EMPTY_ARRAY = [] as const;

export function HKMapTraces({ zoomHandler }: HKMapTracesProps) {
    useSignals();
    const isV1 = uiStore.isV1.value;
    const container = useSignal<HTMLDivElement | null>(null);
    const canvas = useSignal<HTMLCanvasElement | null>(null);
    const autoSizeCanvas = useAutoSizeCanvas(container, canvas);
    const zoomPosition = useSignal({ offsetX: 0, offsetY: 0, scale: 1 });
    const knightPinImage = useSignal<HTMLImageElement | null>(null);
    const shadePinImage = useSignal<HTMLImageElement | null>(null);

    useSignalEffect(function tracesCanvasEffect() {
        const _canvas = autoSizeCanvas.value;
        if (!_canvas.canvas || isV1) return;

        // scaling
        const boundsAspectRatio = mapVisualExtends.size.x / mapVisualExtends.size.y;
        const canvasAspectRatio = _canvas.widthInUnits / _canvas.heightInUnits;

        const mapDistanceToCanvasUnits =
            boundsAspectRatio > canvasAspectRatio
                ? _canvas.widthInUnits / mapVisualExtends.size.x
                : _canvas.heightInUnits / mapVisualExtends.size.y;

        const scaler = zoomPosition.value.scale * mapDistanceToCanvasUnits;

        const xOffset =
            _canvas.widthInUnits / 2 -
            mapVisualExtends.center.x * mapDistanceToCanvasUnits +
            zoomPosition.value.offsetX * mapDistanceToCanvasUnits;
        const yOffset =
            _canvas.heightInUnits / 2 -
            mapVisualExtends.center.y * mapDistanceToCanvasUnits +
            zoomPosition.value.offsetY * mapDistanceToCanvasUnits;
        function x(v: number) {
            return v * scaler + xOffset;
        }
        function y(v: number) {
            return v * scaler + yOffset;
        }

        // animation
        const minMsIntoGame = animationStore.msIntoGame.value - traceStore.lengthMs.value;
        const maxMsIntoGame = animationStore.msIntoGame.value;

        const positionEvents = gameplayStore.recording.value?.playerPositionEventsWithTracePosition ?? EMPTY_ARRAY;

        const visibility = traceStore.visibility.value;

        const firstIndex =
            visibility === 'animated' && positionEvents.length > 0 && minMsIntoGame > positionEvents[0]!.msIntoGame
                ? binarySearchLastIndexBefore(positionEvents, minMsIntoGame, (v) => v.msIntoGame)
                : 0;

        const ctx = _canvas.canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, _canvas.widthInUnits, _canvas.heightInUnits);

        if (visibility === 'hide' || firstIndex === -1) return;

        ctx.fillStyle = 'transparent';
        // using sqrt so the line becomes thicker when zooming in, but not at the same speed
        // as everything else grows.
        const baseLineWidth = mapDistanceToCanvasUnits * zoomPosition.value.scale ** 0.5;

        let i = firstIndex;
        let event = positionEvents[i];
        let previousEvent = null;
        if (!event) return;
        ctx.strokeStyle = `rgb(225 29 72/1)`; // tailwind rose-600
        const dashArray = [baseLineWidth * 1, baseLineWidth * 2];

        while (event && (visibility === 'all' || event.msIntoGame <= maxMsIntoGame)) {
            if (previousEvent) {
                const opacity =
                    visibility === 'animated' ? 1 - (maxMsIntoGame - event.msIntoGame) / traceStore.lengthMs.value : 1;

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
        const frameEvent = animationStore.currentFrameEndEvent.value;
        const recording = gameplayStore.recording.value;
        if (traceStore.visibility.value === 'animated' && recording && frameEvent && frameEvent.shadeScene != 'None') {
            const mapPosition = playerPositionToMapPosition(
                new Vector2(frameEvent.shadePositionX, frameEvent.shadePositionY),
                recording.sceneEvents.find((it) => it.sceneName === frameEvent.shadeScene)!,
            );
            if (mapPosition) {
                const shadePin = shadePinImage.value!;
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
            visibility === 'animated' &&
            previousEvent &&
            previousEvent.msIntoGame + 30000 >= maxMsIntoGame // 15000
        ) {
            const knightPin = knightPinImage.value!;
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

    useSignalEffect(function tracesZoomEffect() {
        zoomHandler.current = (event) => {
            zoomPosition.value = {
                offsetX: event.transform.x,
                offsetY: event.transform.y,
                scale: event.transform.k,
            };
        };
    });

    return (
        <div className="pointer-events-none absolute inset-0" ref={signalRef(container)}>
            <Image
                src={knightPinSrc}
                alt="knight pin"
                className="hidden"
                ref={signalRef(knightPinImage)}
                loading="eager"
            />
            <Image
                src={shadePinSrc}
                alt="shade pin"
                className="hidden"
                ref={signalRef(shadePinImage)}
                loading="eager"
            />
            <canvas ref={signalRef(canvas)} className="pointer-events-none absolute inset-0 h-full w-full" />
        </div>
    );
}
