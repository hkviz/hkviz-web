import { Pause, Play } from 'lucide-solid';
import { Index, Show, createEffect, createMemo, createSignal, onCleanup } from 'solid-js';
import { cardRoundedMdOnlyClasses } from '~/components/ui/additions';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { Slider, SliderFill, SliderThumb, SliderTrack } from '~/components/ui/slider';
import { TextField, TextFieldInput } from '~/components/ui/text-field';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { cn } from '~/lib/utils';
import { mainRoomDataBySceneName } from '../../parser';
import { createAutoSizeCanvas } from '../canvas';
import { Duration } from '../duration';
import {
	changeRoomColorForDarkTheme,
	changeRoomColorForLightTheme,
	useAnimationStore,
	useGameplayStore,
	useHoverMsStore,
	useRoomDisplayStore,
	useThemeStore,
	useUiStore,
} from '../store';

function Times(props: { class?: string }) {
	return (
		<span class={cn('text-sm opacity-50', props.class)} aria-label="times">
			&times;
		</span>
	);
}

function PlayButton() {
	const gameplayStore = useGameplayStore();
	const animationStore = useAnimationStore();
	const isPlaying = animationStore.isPlaying;
	const isDisabled = !gameplayStore.recording;
	return (
		<Tooltip>
			<TooltipTrigger
				as={() => (
					<Button onClick={animationStore.togglePlaying} variant="ghost" disabled={isDisabled}>
						<Show when={isPlaying()} fallback={<Play class="h-5 w-5" />}>
							<Pause class="h-5 w-5" />
						</Show>
					</Button>
				)}
			/>
			<TooltipContent>{isPlaying() ? 'Pause' : 'Play'}</TooltipContent>
		</Tooltip>
	);
}

const EMPTY_ARRAY = [] as const;

function AnimationTimeLineColorCodes() {
	const uiStore = useUiStore();
	const animationStore = useAnimationStore();
	const roomDisplayStore = useRoomDisplayStore();
	const gameplayStore = useGameplayStore();
	const hoverMsStore = useHoverMsStore();
	const timeFrameMs = gameplayStore.timeFrame;
	const themeStore = useThemeStore();

	const sceneChanges = createMemo(function timelineColorCodesSceneChangesComputed() {
		const sceneEvents = gameplayStore.recording()?.sceneEvents ?? EMPTY_ARRAY;
		const timeframe = gameplayStore.timeFrame();
		const theme = themeStore.currentTheme();
		const sceneChanges = sceneEvents.map((it) => {
			const mainVirtualScene = it.getMainVirtualSceneName();
			const mainRoomData = mainRoomDataBySceneName.get(mainVirtualScene);

			const roomColor = mainRoomData?.color;
			let color: string;
			if (!roomColor) {
				color = theme === 'dark' ? 'white' : 'black';
			} else {
				color =
					theme === 'dark' ? changeRoomColorForDarkTheme(roomColor) : changeRoomColorForLightTheme(roomColor);
			}

			return {
				mainVirtualScene,
				startMs: it.msIntoGame,
				mainRoomData,
				color,
				durationMs: 0,
			};
		});
		for (let i = 0; i < sceneChanges.length; i++) {
			sceneChanges[i]!.durationMs = (sceneChanges[i + 1]?.startMs ?? timeframe.max) - sceneChanges[i]!.startMs;
		}
		return sceneChanges;
	});

	const [canvas, setCanvas] = createSignal<HTMLCanvasElement | null>(null);
	const [container, setContainer] = createSignal<HTMLDivElement | null>(null);

	const autoSizeCanvas = createAutoSizeCanvas(container, canvas);

	createEffect(function drawTimelineColorCodesEffect() {
		const _sceneChanges = sceneChanges();
		const _c = autoSizeCanvas();
		const timeframe = gameplayStore.timeFrame();
		const selectedScene = roomDisplayStore.selectedSceneName();
		const selectedZone = roomDisplayStore.selectedRoomZoneFormatted();

		if (!_c || !_sceneChanges) return;
		const ctx = _c.canvas?.getContext('2d');
		if (!ctx) return;

		ctx.clearRect(0, 0, _c.widthInUnits, _c.heightInUnits);

		for (const sceneChange of _sceneChanges) {
			const isSelectedScene = sceneChange.mainVirtualScene === selectedScene;
			const isSelectedZone = sceneChange.mainRoomData?.zoneNameFormatted === selectedZone;

			const height = isSelectedScene ? 1 : isSelectedZone ? 0.666 : 0.333;

			const position = 1 - height;

			ctx.fillStyle = sceneChange.color;
			ctx.fillRect(
				(_c.widthInUnits * sceneChange.startMs) / timeframe.max,
				_c.heightInUnits * position,
				(_c.widthInUnits * sceneChange.durationMs) / timeframe.max,
				_c.heightInUnits * height,
			);
		}
	});

	function getSceneChangeFromMouseEvent(e: MouseEvent) {
		const _sceneChanges = sceneChanges();
		const _container = container();
		if (!_container) return undefined;
		const rect = _container.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const ms = timeFrameMs().max * (x / rect.width);
		return _sceneChanges.findLast((it) => it.startMs <= ms);
	}

	function handleMouseMove(e: MouseEvent) {
		const sceneChange = getSceneChangeFromMouseEvent(e);
		if (!sceneChange) return;
		roomDisplayStore.setSelectedRoomIfNotPinned(sceneChange.mainVirtualScene);
		roomDisplayStore.setHoveredRoom(sceneChange.mainVirtualScene);
		hoverMsStore.setHoveredMsIntoGame(sceneChange.startMs);
	}
	function handleClick(e: MouseEvent) {
		const sceneChange = getSceneChangeFromMouseEvent(e);
		console.log(sceneChange);
		if (!sceneChange) return;
		animationStore.setMsIntoGame(sceneChange.startMs);
		roomDisplayStore.togglePinnedRoom(sceneChange.mainVirtualScene, 'timeline-color-code-click', true);
		uiStore.showMapIfOverview();
	}
	function handleMouseLeave() {
		roomDisplayStore.setHoveredRoom(null);
		hoverMsStore.setHoveredMsIntoGame(null);
	}

	return (
		<div
			class="animation-timeline-color-codes absolute bottom-0 left-0 right-0 h-3"
			ref={(el) => setContainer(el)}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			onClick={handleClick}
		>
			<span class="absolute -left-3 top-[50%] hidden -translate-x-full translate-y-[-35%] text-[0.6rem] @3xl:block">
				Area
			</span>
			<canvas ref={(el) => setCanvas(el)} class="absolute inset-0 h-full w-full" />
		</div>
	);
}

function AnimationTimeLineSlider() {
	const uiStore = useUiStore();
	const animationStore = useAnimationStore();
	const roomDisplayStore = useRoomDisplayStore();
	const gameplayStore = useGameplayStore();

	const animationMsIntoGame = animationStore.msIntoGame;
	const timeFrame = gameplayStore.timeFrame;
	const isDisabled = !gameplayStore.recording;

	let isShiftPressed = false;

	const dragRef = {
		isDragging: false,
		startedAtMsIntoGame: null as null | number,
		previousDiff: 0,
	};
	createEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === 'Shift') {
				if (isShiftPressed) return;
				isShiftPressed = true;
			}
		}
		function handleKeyUp(e: KeyboardEvent) {
			if (e.key === 'Shift') {
				if (!isShiftPressed) return;
				isShiftPressed = false;
			}
		}

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);

		onCleanup(() => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
		});
	});

	// Here we scale the pointer movement to be 10% of the actual movement when shift is pressed.
	// so the user can move the slider more precisely.
	// thats pretty hacky, since we are manipulating the event object.
	// Atm the slider context is not exposed from kobalte, and I didn't find a better way to do this.

	let previousScaledX = 0;
	let previousActualX = 0;
	function onPointerDown(e: PointerEvent) {
		previousScaledX = e.clientX;
		previousActualX = e.clientX;
	}

	function onPointerMove(e: PointerEvent) {
		// console.log('onPointerMove', { isShiftPressed });
		const scaler = isShiftPressed ? 0.1 : 1;
		const diff = e.clientX - previousActualX;
		const scaledX = previousScaledX + diff * scaler;
		previousActualX = e.clientX;
		previousScaledX = scaledX;
		Object.defineProperty(e, 'clientX', {
			get: () => scaledX,
		});
	}

	return (
		<Slider
			value={[animationMsIntoGame()]}
			minValue={timeFrame().min}
			maxValue={timeFrame().max}
			step={10}
			class="-my-4 grow py-4"
			disabled={isDisabled}
			onChange={(values) => {
				const newMsIntoGame = values[0]!;

				animationStore.setMsIntoGame(newMsIntoGame);
				uiStore.showMapIfOverview();
				dragRef.previousDiff = 0; //diff;

				if (!roomDisplayStore.selectedScenePinned()) {
					const sceneEvent = gameplayStore.recording()?.sceneEventFromMs(newMsIntoGame);
					if (sceneEvent) {
						roomDisplayStore.setSelectedRoomIfNotPinned(sceneEvent.getMainVirtualSceneName());
					}
				}
			}}
			onChangeEnd={() => {
				dragRef.isDragging = false;
				dragRef.startedAtMsIntoGame = null;
				dragRef.previousDiff = 0;
			}}
		>
			<SliderTrack onPointerDown={onPointerDown} onPointerMove={onPointerMove}>
				<SliderFill class="rounded-full" />
				<SliderThumb onPointerDown={onPointerDown} onPointerMove={onPointerMove} />
			</SliderTrack>
		</Slider>
	);
}

// this is in an extra components, so the parent does not need to depend on animationMsIntoGame.
// Which changes very often when animating, rendering is therefore skipped for the siblings and the parent.
export function AnimationTimeLine(props: { class?: string }) {
	const hoverMsStore = useHoverMsStore();
	const gameplayStore = useGameplayStore();

	const hoveredMsIntoGame = hoverMsStore.hoveredMsIntoGame;
	const timeFrame = gameplayStore.timeFrame;

	return (
		<div class={cn('relative flex h-5 shrink grow flex-col gap-2 @3xl:h-10 @3xl:justify-center', props.class)}>
			<div>
				<AnimationTimeLineSlider />
			</div>
			<div class="pointer-events-none absolute bottom-0 left-0 right-0 top-0">
				<Show when={hoveredMsIntoGame()}>
					{(hoveredMsIntoGame) => (
						<div
							class="absolute bottom-0 top-0 w-px bg-foreground"
							style={{ left: (100 * hoveredMsIntoGame()) / timeFrame().max + '%' }}
						/>
					)}
				</Show>
			</div>
			<AnimationTimeLineColorCodes />
		</div>
	);
}

export function AnimationOptions(props: { class?: string }) {
	const animationStore = useAnimationStore();
	const animationSpeedMultiplier = animationStore.speedMultiplier;

	return (
		<div class={cn('@container', props.class)}>
			<Card
				class={cn(
					cardRoundedMdOnlyClasses,
					'animation-time g-1 bottom-0 grid grid-cols-[auto_1fr_auto] flex-row items-center justify-center border-t @3xl:grid-cols-[auto_auto_1fr_auto]',
				)}
			>
				<PlayButton />
				<Duration ms={animationStore.msIntoGame()} class="pr-3" withTooltip={true} />
				<AnimationTimeLine class="col-span-3 row-start-2 mx-2 @3xl:col-span-1 @3xl:row-auto @3xl:px-0" />
				<div class="relative">
					<Popover>
						<PopoverTrigger as={Button} variant="ghost">
							<Times />
							{Number.isNaN(animationSpeedMultiplier()) ? 0 : animationSpeedMultiplier()}
						</PopoverTrigger>
						{/* <PopoverTrigger>abc</PopoverTrigger> */}
						<PopoverContent class="w-40 p-0">
							<Index each={[250, 100, 75, 50, 25, 10]}>
								{(it) => (
									<Button
										onClick={() => animationStore.setSpeedMultiplier(it)}
										variant="ghost"
										class="w-full"
									>
										<Times />
										<span>{it()}</span>
									</Button>
								)}
							</Index>

							<div class="relative w-full">
								<Times class="absolute left-4 top-[50%] translate-y-[-50%]" />
								<TextField>
									<TextFieldInput
										type="number"
										placeholder="Custom speed"
										value={animationSpeedMultiplier().toString()}
										class="m-2 w-[calc(100%-1rem)] rounded-sm pl-8 outline-hidden"
										onChange={(v: any) => {
											try {
												const vv = Number.parseInt(v.target.value);
												animationStore.setSpeedMultiplier(vv);
											} catch (e) {
												// ignore
												console.log(e);
											}
										}}
									/>
								</TextField>
							</div>
						</PopoverContent>
					</Popover>
				</div>
			</Card>
		</div>
	);
}
