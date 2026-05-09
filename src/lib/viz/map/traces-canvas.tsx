import { createEffect, createSignal, onCleanup, type Component, untrack } from 'solid-js';
import { Vector2 } from '~/lib/game-data/shared/vector2';
import { isFrameEndEventHollow } from '~/lib/parser/recording-files/events-hollow/frame-end-event-check-hollow';
import { isFrameEndEventSilk } from '~/lib/parser/recording-files/events-silk/frame-end-event-check-silk';
import { binarySearchLastIndexBefore } from '~/lib/util/binary-search';
import { createAutoSizeCanvas } from '../canvas';
import { corpsePinSourceOrUndefined, dreamGatePinSrc, heroPinSourceOrUndefined } from '../img-urls';
import { useAnimationStore } from '../store/animation-store';
import { useAnimationTickStore } from '../store/animation-tick-store';
import { TickListenerOrder } from '../store/animation-tick-store';
import { useGameplayStore } from '../store/gameplay-store';
import { useMapZoomStore } from '../store/map-zoom-store';
import type { TraceVisibility } from '../store/trace-store';
import { useTraceStore } from '../store/trace-store';
import type { GameModuleAny } from '~/lib/game-module/game-module';
import type { PlayerPositionEvent } from '~/lib/parser/recording-files/events-shared/player-position-event';
import type { CombinedRecordingAny } from '~/lib/parser/recording-files/parser-specific/combined-recording';
import type { FrameEndEventAny } from '~/lib/parser/recording-files/events-specific/frame-end-event-of-game';
import type { GameId } from '~/lib/types/game-ids';

const EMPTY_ARRAY = [] as const;

export const HKMapTraces: Component = () => {
	const animationStore = useAnimationStore();
	const animationTickStore = useAnimationTickStore();
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

	type DrawState = {
		initialized: boolean;
		didChange: boolean;
		pinSizeTick: number;
		canvasEl: HTMLCanvasElement | null;
		canvasWidth: number;
		canvasHeight: number;
		gameModule: GameModuleAny | null;
		transformScale: number;
		transformOffsetX: number;
		transformOffsetY: number;
		msIntoGame: number;
		traceLengthMs: number;
		visibility: TraceVisibility;
		positionEvents: readonly PlayerPositionEvent[];
		recording: CombinedRecordingAny | null;
		frameEvent: FrameEndEventAny | null;
		game: GameId | null;
	};

	const drawState: DrawState = {
		initialized: false,
		didChange: true,
		pinSizeTick: 0,
		canvasEl: null,
		canvasWidth: 0,
		canvasHeight: 0,
		gameModule: null,
		transformScale: 1,
		transformOffsetX: 0,
		transformOffsetY: 0,
		msIntoGame: 0,
		traceLengthMs: 0,
		visibility: 'fade_out',
		positionEvents: EMPTY_ARRAY,
		recording: null,
		frameEvent: null,
		game: gameplayStore.game() ?? null,
	};

	function readDrawState(state: DrawState) {
		state.didChange = !state.initialized;
		const canvasState = autoSizeCanvas();
		const transform = mapZoomStore.transform();
		const recording = gameplayStore.recording();

		const nextPinSizeTick = pinSizeTick();
		if (state.pinSizeTick !== nextPinSizeTick) {
			state.pinSizeTick = nextPinSizeTick;
			state.didChange = true;
		}

		if (state.canvasEl !== canvasState.canvas) {
			state.canvasEl = canvasState.canvas;
			state.didChange = true;
		}
		if (state.canvasWidth !== canvasState.widthInUnits) {
			state.canvasWidth = canvasState.widthInUnits;
			state.didChange = true;
		}
		if (state.canvasHeight !== canvasState.heightInUnits) {
			state.canvasHeight = canvasState.heightInUnits;
			state.didChange = true;
		}

		const nextGameModule = gameplayStore.gameModule();
		if (state.gameModule !== nextGameModule) {
			state.gameModule = nextGameModule;
			state.didChange = true;
		}

		if (state.transformScale !== transform.scale) {
			state.transformScale = transform.scale;
			state.didChange = true;
		}
		if (state.transformOffsetX !== transform.offsetX) {
			state.transformOffsetX = transform.offsetX;
			state.didChange = true;
		}
		if (state.transformOffsetY !== transform.offsetY) {
			state.transformOffsetY = transform.offsetY;
			state.didChange = true;
		}

		const nextMsIntoGame = animationStore.msIntoGame();
		if (state.msIntoGame !== nextMsIntoGame) {
			state.msIntoGame = nextMsIntoGame;
			state.didChange = true;
		}

		const nextTraceLengthMs = traceStore.lengthMs();
		if (state.traceLengthMs !== nextTraceLengthMs) {
			state.traceLengthMs = nextTraceLengthMs;
			state.didChange = true;
		}

		const nextVisibility = traceStore.visibility();
		if (state.visibility !== nextVisibility) {
			state.visibility = nextVisibility;
			state.didChange = true;
		}

		const nextPositionEvents = recording?.playerPositionEventsWithTracePosition ?? EMPTY_ARRAY;
		if (state.positionEvents !== nextPositionEvents) {
			state.positionEvents = nextPositionEvents;
			state.didChange = true;
		}

		if (state.recording !== recording) {
			state.recording = recording;
			state.didChange = true;
		}

		const nextFrameEvent = animationStore.currentFrameEndEvent();
		if (state.frameEvent !== nextFrameEvent) {
			state.frameEvent = nextFrameEvent;
			state.didChange = true;
		}

		const nextGame = gameplayStore.game();
		if (state.game !== nextGame) {
			state.game = nextGame;
			state.didChange = true;
		}

		state.initialized = true;
	}

	function drawTraces(state: DrawState) {
		const _canvas = {
			canvas: state.canvasEl,
			widthInUnits: state.canvasWidth,
			heightInUnits: state.canvasHeight,
		};
		const gameModule = state.gameModule;
		const visualExtends = gameModule?.map.extends;
		if (!_canvas.canvas || !visualExtends) return;

		// scaling
		const boundsAspectRatio = visualExtends.size.x / visualExtends.size.y;
		const canvasAspectRatio = _canvas.widthInUnits / _canvas.heightInUnits;

		const mapDistanceToCanvasUnits =
			boundsAspectRatio > canvasAspectRatio
				? _canvas.widthInUnits / visualExtends.size.x
				: _canvas.heightInUnits / visualExtends.size.y;

		const scaler = state.transformScale * mapDistanceToCanvasUnits;

		const xOffset =
			_canvas.widthInUnits / 2 -
			visualExtends.center.x * mapDistanceToCanvasUnits +
			state.transformOffsetX * mapDistanceToCanvasUnits;
		const yOffset =
			_canvas.heightInUnits / 2 -
			visualExtends.center.y * mapDistanceToCanvasUnits +
			state.transformOffsetY * mapDistanceToCanvasUnits;
		function x(v: number) {
			return v * scaler + xOffset;
		}
		function y(v: number) {
			return v * scaler + yOffset;
		}

		// animation
		const traceLengthMs = state.traceLengthMs;
		const minMsIntoGame = state.msIntoGame - traceLengthMs;
		const maxMsIntoGame = state.msIntoGame;
		const game = state.game;

		const positionEvents = state.positionEvents;

		const visibility = state.visibility;

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
		const baseLineWidth = mapDistanceToCanvasUnits * state.transformScale ** 0.5;
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
		let previousAlpha: number | null = null;
		let hasOpenPath = false;

		function flushPath(targetAlpha: number) {
			// if alpha stacking is not wanted, one can clear the area below the new path
			// beforehand --> could allow for more skipping overlapped paths (--> no angle check below)
			// but alpha stacking is useful. bc one sees quickly where one spent a lot of time

			/*if (hasDrawnPath && targetAlpha < 1) {
				// only need to clear pixels behind new path if a path is already drawn
				context.globalCompositeOperation = 'destination-out';
				context.globalAlpha = 1.0; // Full strength eraser
				context.stroke();
			} else {
				hasDrawnPath = true;
			}*/

			context.globalCompositeOperation = 'source-over';
			context.globalAlpha = targetAlpha;
			context.stroke();
		}

		let segmentStartX: number = 0;
		let segmentStartY: number = 0;

		// let drawnPaths = 0;
		// let skippedPaths = 0;

		function drawSegment(from: PositionEvent, to: PositionEvent, targetAlpha: number) {
			const fromPos = from.mapPosition!;
			const toPos = to.mapPosition!;

			const fromX = x(fromPos.x);
			const fromY = y(fromPos.y);
			const toX = x(toPos.x);
			const toY = y(toPos.y);

			const isJump = (to.mapDistanceToPrevious ?? 0) > jumpThreshold;
			const jumpChanged = isJump !== previousIsJump;
			const alphaChanged = targetAlpha !== previousAlpha;

			const moveX = toX - fromX;
			const moveY = toY - fromY;

			let isReversing = false;
			if (
				!jumpChanged && // skip if already new path
				!alphaChanged && // skip if already new path
				targetAlpha < 1 && // overlaps don't matter when alpha = 1
				(moveX !== 0 || moveY !== 0) &&
				(segmentStartX !== 0 || segmentStartY !== 0)
			) {
				const dot = (segmentStartX - toX) * moveX + (segmentStartY - toY) * moveY;
				// cosTheta < 0    => > 90deg
				// cosTheta < -0.5 => > 120deg
				// cosTheta < -0.7 => > 135deg

				if (dot <= -0.5) {
					// when angle changes a lot a new path is started
					// bc otherwise the alpha does not stack in overlaps.
					// we assume path does not overlap (mostly) when the direction doesn't change too much.
					isReversing = true;
				}
			}

			const requireNewPath = jumpChanged || alphaChanged || isReversing;

			if (requireNewPath) {
				// reducing number of paths drawn (especially stroke() calls) improves performance
				// greatly.
				if (hasOpenPath) {
					flushPath(previousAlpha ?? 1);
				}
				context.beginPath();
				previousAlpha = targetAlpha;
				context.setLineDash(isJump ? dashArray : EMPTY_ARRAY);
				context.lineWidth = isJump ? halfBaseLineWidth : baseLineWidth;
				previousIsJump = isJump;
				hasOpenPath = true;

				segmentStartX = moveX;
				segmentStartY = moveY;
				// drawnPaths++;
			}
			// else {
			// skippedPaths++;
			// }

			context.moveTo(fromX, fromY);
			context.lineTo(toX, toY);
		}

		if (visibility === 'stay') {
			while (event && event.msIntoGame <= maxMsIntoGame) {
				if (previousEvent) {
					drawSegment(previousEvent, event, 1);
				}

				i++;
				previousEvent = event;
				event = positionEvents[i];
			}
		} else {
			while (event && event.msIntoGame <= maxMsIntoGame) {
				if (previousEvent) {
					const opacity = (1 - (maxMsIntoGame - event.msIntoGame) / traceLengthMs) ** 0.5; // fade out slower
					const opacityRounded = Math.round(opacity * 20) / 20; // round for fewer new paths
					drawSegment(previousEvent, event, opacityRounded);
				}

				i++;
				previousEvent = event;
				event = positionEvents[i];
			}
		}
		if (hasOpenPath) {
			flushPath(previousAlpha ?? 1);
		}
		context.globalAlpha = 1;
		// console.log(
		// 	`drawn paths: ${drawnPaths}, skipped new paths: ${skippedPaths}. Percentage of new paths: ${Math.round((drawnPaths / (drawnPaths + skippedPaths)) * 100)}%`,
		// );

		// frame end pins
		const frameEvent = state.frameEvent;
		const recording = state.recording;
		if (frameEvent && visibility === 'fade_out' && recording && frameEvent) {
			// dream gate
			if (
				isFrameEndEventHollow(frameEvent) &&
				frameEvent.dreamGateScene != null &&
				frameEvent.dreamGateScene !== '' &&
				gameModule.game === 'hollow' &&
				frameEvent.dreamGateScene !== gameModule.playerDataFields.getDefaultValue('dreamGateScene')
			) {
				const mapPosition = gameModule.map.positionToMap(
					new Vector2(frameEvent.dreamGateX, frameEvent.dreamGateY),
					recording.sceneEvents.find((it) => it.sceneName === frameEvent.dreamGateScene),
				);
				if (mapPosition) {
					const pinSize = baseLineWidth * 8;
					const drawW = pinSize * dreamGatePinWidthMultiplier;
					const drawH = pinSize * dreamGatePinHeightMultiplier;
					ctx.drawImage(
						dreamGateImage,
						x(mapPosition.x) - 0.5 * drawW,
						y(mapPosition.y) - 0.5 * drawH,
						drawW,
						drawH,
					);
				}
			}
			// shade
			const hasShade =
				(isFrameEndEventHollow(frameEvent) &&
					frameEvent.shadeScene != null &&
					frameEvent.shadeScene !== '' &&
					gameModule.game === 'hollow' &&
					frameEvent.shadeScene !== gameModule.playerDataFields.getDefaultValue('shadeScene')) ||
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
						ctx.drawImage(
							shadePinImage,
							x(mapPosition.x) - 0.5 * drawW,
							y(mapPosition.y) - 0.5 * drawH,
							drawW,
							drawH,
						);
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
	}

	createEffect(function tracesCanvasEffect() {
		const removeTickListener = animationTickStore.addTickListener(() => {
			untrack(() => {
				readDrawState(drawState);
				if (!drawState.didChange) {
					return;
				}
				drawTraces(drawState);
			});
		}, TickListenerOrder.TRACES_CANVAS);

		onCleanup(removeTickListener);
	});

	return container;
};
