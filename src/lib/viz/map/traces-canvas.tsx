import { createEffect, createSignal, type Component } from 'solid-js';
import { playerDataFieldsHollow } from '~/lib/game-data/hollow-data/player-data-hollow';
import { Vector2 } from '~/lib/game-data/shared/vectors';
import { isFrameEndEventHollow } from '~/lib/parser/recording-files/events-hollow/frame-end-event-check-hollow';
import { isFrameEndEventSilk } from '~/lib/parser/recording-files/events-silk/frame-end-event-check-silk';
import { binarySearchLastIndexBefore } from '~/lib/util/binary-search';
import { createAutoSizeCanvas } from '../canvas';
import { corpsePinSourceOrUndefined, dreamGatePinSrc, heroPinSourceOrUndefined } from '../img-urls';
import { useAnimationStore } from '../store/animation-store';
import { useGameplayStore } from '../store/gameplay-store';
import { useMapZoomStore } from '../store/map-zoom-store';
import { useTraceStore } from '../store/trace-store';

const EMPTY_ARRAY = [] as const;

export const HKMapTraces: Component = () => {
	const animationStore = useAnimationStore();
	const traceStore = useTraceStore();
	const mapZoomStore = useMapZoomStore();
	const gameplayStore = useGameplayStore();
	const [pinSizeTick, setPinSizeTick] = createSignal(0);

	let knightPinWidthMultiplier = 1;
	let knightPinHeightMultiplier = 1;
	let shadePinWidthMultiplier = 1;
	let shadePinHeightMultiplier = 1;
	let dreamGatePinWidthMultiplier = 1;
	let dreamGatePinHeightMultiplier = 1;

	function initializePinSizeMultipliers(
		img: HTMLImageElement,
		setWidthMultiplier: (multiplier: number) => void,
		setHeightMultiplier: (multiplier: number) => void,
	) {
		const imgW = img.naturalWidth;
		const imgH = img.naturalHeight;
		if (!imgW || !imgH) return;

		if (imgW < imgH) {
			setWidthMultiplier(1);
			setHeightMultiplier(imgH / imgW);
		} else {
			setWidthMultiplier(imgW / imgH);
			setHeightMultiplier(1);
		}

		setPinSizeTick((tick) => tick + 1);
	}

	const canvas = (<canvas class="pointer-events-none absolute inset-0 h-full w-full" />) as HTMLCanvasElement;
	const knightPinImage = (
		<img
			src={heroPinSourceOrUndefined(gameplayStore.game())}
			alt="knight pin"
			class="hidden"
			loading="eager"
			onLoad={(event) =>
				initializePinSizeMultipliers(
					event.currentTarget,
					(multiplier) => (knightPinWidthMultiplier = multiplier),
					(multiplier) => (knightPinHeightMultiplier = multiplier),
				)
			}
		/>
	) as HTMLImageElement;
	const shadePinImage = (
		<img
			src={corpsePinSourceOrUndefined(gameplayStore.game())}
			alt="shade pin"
			class="hidden"
			loading="eager"
			onLoad={(event) =>
				initializePinSizeMultipliers(
					event.currentTarget,
					(multiplier) => (shadePinWidthMultiplier = multiplier),
					(multiplier) => (shadePinHeightMultiplier = multiplier),
				)
			}
		/>
	) as HTMLImageElement;
	const dreamGateImage = (
		<img
			src={dreamGatePinSrc}
			alt="dream gate"
			class="hidden"
			loading="eager"
			onLoad={(event) =>
				initializePinSizeMultipliers(
					event.currentTarget,
					(multiplier) => (dreamGatePinWidthMultiplier = multiplier),
					(multiplier) => (dreamGatePinHeightMultiplier = multiplier),
				)
			}
		/>
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
		pinSizeTick();
		const _canvas = autoSizeCanvas();
		const gameModule = gameplayStore.gameModule();
		const visualExtends = gameModule?.map.extends;
		if (!_canvas.canvas || !visualExtends) return;

		// scaling
		const boundsAspectRatio = visualExtends.size.x / visualExtends.size.y;
		const canvasAspectRatio = _canvas.widthInUnits / _canvas.heightInUnits;

		const mapDistanceToCanvasUnits =
			boundsAspectRatio > canvasAspectRatio
				? _canvas.widthInUnits / visualExtends.size.x
				: _canvas.heightInUnits / visualExtends.size.y;

		const transform = mapZoomStore.transform();

		const scaler = transform.scale * mapDistanceToCanvasUnits;

		const xOffset =
			_canvas.widthInUnits / 2 -
			visualExtends.center.x * mapDistanceToCanvasUnits +
			transform.offsetX * mapDistanceToCanvasUnits;
		const yOffset =
			_canvas.heightInUnits / 2 -
			visualExtends.center.y * mapDistanceToCanvasUnits +
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
		const game = gameplayStore.game();

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
		const jumpThreshold = gameModule.map.scale(1.5);

		let i = firstIndex;
		type PositionEvent = (typeof positionEvents)[number];
		let event = positionEvents[i];
		let previousEvent: PositionEvent | null = null;
		if (!event) return;
		context.strokeStyle = `rgb(225 29 72/1)`; // tailwind rose-600
		const dashArray = [baseLineWidth, baseLineWidth * 2];
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
		if (frameEvent && traceStore.visibility() === 'fade_out' && recording && frameEvent) {
			// dream gate
			if (
				isFrameEndEventHollow(frameEvent) &&
				frameEvent.dreamGateScene !== playerDataFieldsHollow.byFieldName.dreamGateScene.defaultValue
			) {
				const mapPosition = gameModule.map.positionToMap(
					new Vector2(frameEvent.dreamGateX, frameEvent.dreamGateY),
					recording.sceneEvents.find((it) => it.sceneName === frameEvent.dreamGateScene),
				);
				if (mapPosition) {
					const pinSize = baseLineWidth * 8;
					const drawW = pinSize * dreamGatePinWidthMultiplier;
					const drawH = pinSize * dreamGatePinHeightMultiplier;
					ctx.shadowColor = 'rgba(255,255,255,0.6)';
					ctx.shadowOffsetX = 0;
					ctx.shadowOffsetY = 0;
					ctx.shadowBlur = baseLineWidth * 4;
					ctx.drawImage(
						dreamGateImage,
						x(mapPosition.x) - 0.5 * drawW,
						y(mapPosition.y) - 0.5 * drawH,
						drawW,
						drawH,
					);
					ctx.shadowBlur = 0;
				}
			}
			// shade
			const hasShade =
				(isFrameEndEventHollow(frameEvent) &&
					frameEvent.shadeScene !== playerDataFieldsHollow.byFieldName.shadeScene.defaultValue) ||
				(isFrameEndEventSilk(frameEvent) && frameEvent.HeroCorpseScene);

			if (hasShade) {
				const position = isFrameEndEventHollow(frameEvent)
					? new Vector2(frameEvent.shadePositionX, frameEvent.shadePositionY)
					: isFrameEndEventSilk(frameEvent)
						? frameEvent.HeroDeathScenePos
						: null;
				const sceneName = isFrameEndEventHollow(frameEvent)
					? frameEvent.shadeScene
					: isFrameEndEventSilk(frameEvent)
						? frameEvent.HeroCorpseScene
						: null;

				if (position && sceneName) {
					const sceneEvent = recording.sceneEvents.find((it) => it.sceneName === sceneName);
					const mapPosition = gameModule?.map.positionToMap(position, sceneEvent);
					if (mapPosition) {
						const pinSize = game === 'hollow' ? baseLineWidth * 12 : baseLineWidth * 9;
						const drawW = pinSize * shadePinWidthMultiplier;
						const drawH = pinSize * shadePinHeightMultiplier;
						ctx.shadowColor = 'rgba(255,255,255,0.6)';
						ctx.shadowOffsetX = 0;
						ctx.shadowOffsetY = 0;
						ctx.shadowBlur = baseLineWidth * 4;
						ctx.drawImage(
							shadePinImage,
							x(mapPosition.x) - 0.5 * drawW,
							y(mapPosition.y) - 0.5 * drawH,
							drawW,
							drawH,
						);
						ctx.shadowBlur = 0;
					}
				}
			}
		}

		// knight pin
		if (
			// (visibility === 'fade_out' || maxMsIntoGame <= gameplayMaxMsIntoGame) &&
			previousEvent &&
			previousEvent.msIntoGame + 30000 >= maxMsIntoGame // 15000
		) {
			const baseSizeHollow = baseLineWidth * 15;
			const baseSizeSilk = baseLineWidth * 13;

			const drawW = game === 'hollow' ? baseSizeHollow : baseSizeSilk * knightPinWidthMultiplier;
			const drawH = game === 'hollow' ? baseSizeHollow : baseSizeSilk * knightPinHeightMultiplier;

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
