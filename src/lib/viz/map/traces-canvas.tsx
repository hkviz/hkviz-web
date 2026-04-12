import { createEffect, type Component } from 'solid-js';
import { hollowScale } from '~/lib/game-data/hollow-data/hollow-scaling';
import { Vector2 } from '~/lib/game-data/shared/vectors';
import { FrameEndEventHollow } from '~/lib/parser/recording-files/events-hollow/frame-end-event-hollow';
import {
	binarySearchLastIndexBefore,
	mapVisualExtends,
	playerDataFieldsHollow,
	playerPositionToMapPositionHollow,
} from '../../parser';
import { createAutoSizeCanvas } from '../canvas';
import { dreamGatePinSrc, heroPinSourceOrUndefined, shadePinSrc } from '../img-urls';
import { useAnimationStore, useGameplayStore, useMapZoomStore, useTraceStore } from '../store';

const EMPTY_ARRAY = [] as const;

export const HKMapTraces: Component = () => {
	const animationStore = useAnimationStore();
	const traceStore = useTraceStore();
	const mapZoomStore = useMapZoomStore();
	const gameplayStore = useGameplayStore();

	const canvas = (<canvas class="pointer-events-none absolute inset-0 h-full w-full" />) as HTMLCanvasElement;
	const knightPinImage = (
		<img src={heroPinSourceOrUndefined(gameplayStore.game())} alt="knight pin" class="hidden" loading="eager" />
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
		if (!_canvas.canvas) return;

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
		const traceLengthMs = traceStore.lengthMs();
		const minMsIntoGame = animationStore.msIntoGame() - traceLengthMs;
		const maxMsIntoGame = animationStore.msIntoGame();

		const positionEvents = gameplayStore.recording()?.playerPositionEventsWithTracePosition ?? EMPTY_ARRAY;

		const visibility = traceStore.visibility();

		const firstIndex =
			visibility === 'fade_out' && positionEvents.length > 0 && minMsIntoGame > positionEvents[0]!.msIntoGame
				? binarySearchLastIndexBefore(positionEvents, minMsIntoGame, (v) => v.msIntoGame)
				: 0;

		const ctx = _canvas.canvas.getContext('2d');
		if (!ctx) return;
		const context = ctx;

		ctx.clearRect(0, 0, _canvas.widthInUnits, _canvas.heightInUnits);

		if (visibility === 'hide' || firstIndex === -1) return;

		ctx.fillStyle = 'transparent';
		// using sqrt so the line becomes thicker when zooming in, but not at the same speed
		// as everything else grows.
		const baseLineWidth = mapDistanceToCanvasUnits * transform.scale ** 0.5;
		const halfBaseLineWidth = baseLineWidth / 2;
		const jumpThreshold = hollowScale(1.5);

		let i = firstIndex;
		type PositionEvent = (typeof positionEvents)[number];
		let event = positionEvents[i];
		let previousEvent: PositionEvent | null = null;
		if (!event) return;
		context.strokeStyle = `rgb(225 29 72/1)`; // tailwind rose-600
		const dashArray = [baseLineWidth * 1, baseLineWidth * 2];
		let previousIsJump: boolean | null = null;

		function drawSegment(from: PositionEvent, to: PositionEvent) {
			const isJump = (to.mapDistanceToPrevious ?? 0) > jumpThreshold;
			if (isJump !== previousIsJump) {
				context.setLineDash(isJump ? dashArray : EMPTY_ARRAY);
				context.lineWidth = isJump ? halfBaseLineWidth : baseLineWidth;
				previousIsJump = isJump;
			}

			context.beginPath();
			context.moveTo(x(from.mapPosition!.x), y(from.mapPosition!.y));
			context.lineTo(x(to.mapPosition!.x), y(to.mapPosition!.y));
			context.stroke();
			context.closePath();
		}

		if (visibility === 'stay') {
			context.globalAlpha = 1;
			while (event && event.msIntoGame <= maxMsIntoGame) {
				if (previousEvent) {
					drawSegment(previousEvent, event);
				}

				i++;
				previousEvent = event;
				event = positionEvents[i];
			}
		} else {
			while (event && event.msIntoGame <= maxMsIntoGame) {
				if (previousEvent) {
					const opacity = 1 - (maxMsIntoGame - event.msIntoGame) / traceLengthMs;
					context.globalAlpha = opacity ** 0.5; // fade out slower
					drawSegment(previousEvent, event);
				}

				i++;
				previousEvent = event;
				event = positionEvents[i];
			}
		}
		context.globalAlpha = 1;

		// frame end pins
		const frameEvent = animationStore.currentFrameEndEvent();
		const recording = gameplayStore.recording();
		if (
			frameEvent instanceof FrameEndEventHollow &&
			traceStore.visibility() === 'fade_out' &&
			recording &&
			frameEvent
		) {
			// dream gate
			if (frameEvent.dreamGateScene !== playerDataFieldsHollow.byFieldName.dreamGateScene.defaultValue) {
				const mapPosition = playerPositionToMapPositionHollow(
					new Vector2(frameEvent.dreamGateX, frameEvent.dreamGateY),
					recording.sceneEvents.find((it) => it.sceneName === frameEvent.dreamGateScene),
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
			if (frameEvent.shadeScene !== playerDataFieldsHollow.byFieldName.shadeScene.defaultValue) {
				const mapPosition = playerPositionToMapPositionHollow(
					new Vector2(frameEvent.shadePositionX, frameEvent.shadePositionY),
					recording.sceneEvents.find((it) => it.sceneName === frameEvent.shadeScene),
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
			// (visibility === 'fade_out' || maxMsIntoGame <= gameplayMaxMsIntoGame) &&
			previousEvent &&
			previousEvent.msIntoGame + 30000 >= maxMsIntoGame // 15000
		) {
			const baseSize = baseLineWidth * 15;

			const imgW = knightPinImage.naturalWidth;
			const imgH = knightPinImage.naturalHeight;

			let drawW, drawH;

			const game = gameplayStore.game();
			if (game == 'hollow') {
				// looks better imo stretched for hollow knight
				// but possibly just used to it
				drawH = baseSize;
				drawW = baseSize;
			} else if (imgW < imgH) {
				// width is smaller → lock width to baseSize
				drawW = baseSize;
				drawH = baseSize * (imgH / imgW);
			} else {
				// height is smaller → lock height to baseSize
				drawH = baseSize;
				drawW = baseSize * (imgW / imgH);
			}

			ctx.drawImage(
				knightPinImage,
				x(previousEvent.mapPosition!.x) - 0.5 * drawW,
				y(previousEvent.mapPosition!.y) - 0.5 * drawH,
				drawW,
				drawH,
			);
		}
	});

	return container;
};
