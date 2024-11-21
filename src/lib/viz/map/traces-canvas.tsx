import { createEffect, type Component } from 'solid-js';
import {
	Vector2,
	binarySearchLastIndexBefore,
	mapVisualExtends,
	playerDataFields,
	playerPositionToMapPosition,
	scale,
} from '../../parser';
import { createAutoSizeCanvas } from '../canvas';
import { dreamGatePinSrc, knightPinSrc, shadePinSrc } from '../img-urls';
import { animationStore, gameplayStore, mapZoomStore, traceStore, uiStore } from '../store';

const EMPTY_ARRAY = [] as const;

export const HKMapTraces: Component = () => {
	const isV1 = uiStore.isV1;

	const canvas = (<canvas class="pointer-events-none absolute inset-0 h-full w-full" />) as HTMLCanvasElement;
	const knightPinImage = (
		<img src={knightPinSrc} alt="knight pin" class="hidden" loading="eager" />
	) as HTMLImageElement;
	const shadePinImage = (
		<img src={shadePinSrc} alt="shade pin" class="hidden" loading="eager" />
	) as HTMLImageElement;
	const dreamGateImage = (
		<img src={dreamGatePinSrc} alt="dream gate" class="hidden" loading="eager" />
	) as HTMLImageElement;

	const container = (
		<div class="pointer-events-none absolute inset-0">
			{canvas}
			{knightPinImage}
			{shadePinImage}
			{dreamGateImage}
		</div>
	) as HTMLDivElement;

	const autoSizeCanvas = createAutoSizeCanvas(
		() => container,
		() => canvas,
	);

	createEffect(function tracesCanvasEffect() {
		const _canvas = autoSizeCanvas();
		if (!_canvas.canvas || isV1()) return;

		// scaling
		const boundsAspectRatio = mapVisualExtends.size.x / mapVisualExtends.size.y;
		const canvasAspectRatio = _canvas.widthInUnits / _canvas.heightInUnits;

		const mapDistanceToCanvasUnits =
			boundsAspectRatio > canvasAspectRatio
				? _canvas.widthInUnits / mapVisualExtends.size.x
				: _canvas.heightInUnits / mapVisualExtends.size.y;

		const transform = mapZoomStore.transform();

		const scaler = transform.scale * mapDistanceToCanvasUnits;

		const xOffset =
			_canvas.widthInUnits / 2 -
			mapVisualExtends.center.x * mapDistanceToCanvasUnits +
			transform.offsetX * mapDistanceToCanvasUnits;
		const yOffset =
			_canvas.heightInUnits / 2 -
			mapVisualExtends.center.y * mapDistanceToCanvasUnits +
			transform.offsetY * mapDistanceToCanvasUnits;
		function x(v: number) {
			return v * scaler + xOffset;
		}
		function y(v: number) {
			return v * scaler + yOffset;
		}

		// animation
		const minMsIntoGame = animationStore.msIntoGame() - traceStore.lengthMs();
		const maxMsIntoGame = animationStore.msIntoGame();

		const positionEvents = gameplayStore.recording()?.playerPositionEventsWithTracePosition ?? EMPTY_ARRAY;

		const visibility = traceStore.visibility();

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
		const baseLineWidth = mapDistanceToCanvasUnits * transform.scale ** 0.5;

		let i = firstIndex;
		let event = positionEvents[i];
		let previousEvent = null;
		if (!event) return;
		ctx.strokeStyle = `rgb(225 29 72/1)`; // tailwind rose-600
		const dashArray = [baseLineWidth * 1, baseLineWidth * 2];

		while (event && (visibility === 'all' || event.msIntoGame <= maxMsIntoGame)) {
			if (previousEvent) {
				const opacity =
					visibility === 'animated' ? 1 - (maxMsIntoGame - event.msIntoGame) / traceStore.lengthMs() : 1;

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
		ctx.globalAlpha = 1;

		// frame end pins
		const frameEvent = animationStore.currentFrameEndEvent();
		const recording = gameplayStore.recording();
		if (traceStore.visibility() === 'animated' && recording && frameEvent) {
			// dream gate
			if (frameEvent.dreamGateScene !== playerDataFields.byFieldName.dreamGateScene.defaultValue) {
				const mapPosition = playerPositionToMapPosition(
					new Vector2(frameEvent.dreamGateX, frameEvent.dreamGateY),
					recording.sceneEvents.find((it) => it.sceneName === frameEvent.dreamGateScene)!,
				);
				if (mapPosition) {
					const pinSize = baseLineWidth * 8;
					ctx.shadowColor = 'rgba(255,255,255,0.6)';
					ctx.shadowOffsetX = 0;
					ctx.shadowOffsetY = 0;
					ctx.shadowBlur = baseLineWidth * 4;
					ctx.drawImage(
						dreamGateImage,
						x(mapPosition.x) - 0.5 * pinSize,
						y(mapPosition.y) - 0.5 * pinSize,
						pinSize,
						pinSize,
					);
					ctx.shadowBlur = 0;
				}
			}
			// shade
			if (frameEvent.shadeScene !== playerDataFields.byFieldName.shadeScene.defaultValue) {
				const mapPosition = playerPositionToMapPosition(
					new Vector2(frameEvent.shadePositionX, frameEvent.shadePositionY),
					recording.sceneEvents.find((it) => it.sceneName === frameEvent.shadeScene)!,
				);
				if (mapPosition) {
					const shadePinSize = baseLineWidth * 12;
					ctx.shadowColor = 'rgba(255,255,255,0.6)';
					ctx.shadowOffsetX = 0;
					ctx.shadowOffsetY = 0;
					ctx.shadowBlur = baseLineWidth * 4;
					ctx.drawImage(
						shadePinImage,
						x(mapPosition.x) - 0.5 * shadePinSize,
						y(mapPosition.y) - 0.5 * shadePinSize,
						shadePinSize,
						shadePinSize,
					);
					ctx.shadowBlur = 0;
				}
			}
		}

		// knight pin
		if (
			visibility === 'animated' &&
			previousEvent &&
			previousEvent.msIntoGame + 30000 >= maxMsIntoGame // 15000
		) {
			const knightPinSize = baseLineWidth * 15;
			ctx.drawImage(
				knightPinImage,
				x(previousEvent.mapPosition!.x) - 0.5 * knightPinSize,
				y(previousEvent.mapPosition!.y) - 0.5 * knightPinSize,
				knightPinSize,
				knightPinSize,
			);
		}
	});

	return container;
};
