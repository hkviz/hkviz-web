'use client';

import {
    Button,
    Card,
    Input,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Slider,
    SliderFill,
    SliderThumb,
    SliderTrack,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    cardRoundedMdOnlyClasses,
    cn,
} from '@hkviz/components';
import { mainRoomDataBySceneName } from '@hkviz/parser';
import {
    animationStore,
    changeRoomColorForDarkTheme,
    changeRoomColorForLightTheme,
    gameplayStore,
    hoverMsStore,
    roomDisplayStore,
    themeStore,
    uiStore,
} from '@hkviz/viz';
import { Pause, Play } from 'lucide-solid';
import { Index, Show, createEffect, createMemo, createSignal, onCleanup } from 'solid-js';
import { render } from 'solid-js/web';
import { createAutoSizeCanvas } from '../canvas';
import { Duration } from '../duration';

function Times(props: { class?: string }) {
    return (
        <span class={cn('text-sm opacity-50', props.class)} aria-label="times">
            &times;
        </span>
    );
}

function PlayButton() {
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
    const timeFrameMs = gameplayStore.timeFrame;

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
            <span class="@3xl:block absolute -left-3 top-[50%] hidden translate-x-[-100%] translate-y-[-35%] text-[0.6rem]">
                Area
            </span>
            <canvas ref={(el) => setCanvas(el)} class="absolute inset-0 h-full w-full" />
        </div>
    );
}

function AnimationTimeLineSlider() {
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

    // let prev = new Date();

    return (
        <Slider
            value={[animationMsIntoGame()]}
            minValue={timeFrame().min}
            maxValue={timeFrame().max}
            step={100}
            class="-my-4 grow py-4"
            disabled={isDisabled}
            onChange={(values) => {
                // console.log(dragRef);

                const isV1 = uiStore.isV1();
                if (!dragRef.isDragging) {
                    dragRef.isDragging = true;
                    dragRef.startedAtMsIntoGame = animationStore.msIntoGame();
                    dragRef.previousDiff = 0;
                }
                const value = values[0]!;
                const diff = value - dragRef.startedAtMsIntoGame!;
                const newDiff = diff - dragRef.previousDiff;

                const scale = isShiftPressed && !isV1 ? 10 : 1;

                const newMsIntoGame = animationStore.msIntoGame() + newDiff / scale;
                animationStore.setMsIntoGame(newMsIntoGame);
                uiStore.showMapIfOverview();
                dragRef.previousDiff = diff;

                if (!isV1 && !roomDisplayStore.selectedScenePinned()) {
                    const sceneEvent = gameplayStore.recording()?.sceneEventFromMs(newMsIntoGame);
                    if (sceneEvent) {
                        roomDisplayStore.setSelectedRoomIfNotPinned(sceneEvent.getMainVirtualSceneName());
                    }
                }

                // const now = new Date();
                // console.log(now.getTime() - prev.getTime(), 'call');
                // prev = now;
            }}
            onChangeEnd={() => {
                dragRef.isDragging = false;
                dragRef.startedAtMsIntoGame = null;
                dragRef.previousDiff = 0;
            }}
        >
            <SliderTrack>
                <SliderFill class="rounded-full" />
                <SliderThumb />
            </SliderTrack>
        </Slider>
    );
}

// this is in an extra components, so the parent does not need to depend on animationMsIntoGame.
// Which changes very often when animating, rendering is therefore skipped for the siblings and the parent.
export function AnimationTimeLine(props: { class?: string }) {
    const hoveredMsIntoGame = hoverMsStore.hoveredMsIntoGame;
    const timeFrame = gameplayStore.timeFrame;
    const isV1 = uiStore.isV1;

    return (
        <div class={cn('@3xl:h-10 @3xl:justify-center relative flex h-5 shrink grow flex-col gap-2', props.class)}>
            <div>
                <AnimationTimeLineSlider />
            </div>
            <Show when={!isV1()}>
                <div class="pointer-events-none absolute bottom-0 left-0 right-0 top-0">
                    <Show when={hoveredMsIntoGame()}>
                        {(hoveredMsIntoGame) => (
                            <div
                                class="bg-foreground absolute bottom-0 top-0 w-[1px]"
                                style={{ left: (100 * hoveredMsIntoGame()) / timeFrame().max + '%' }}
                            />
                        )}
                    </Show>
                </div>
            </Show>
            <Show when={!isV1()}>
                <AnimationTimeLineColorCodes />
            </Show>
        </div>
    );
}

export function AnimationOptions(props: { class?: string }) {
    const animationSpeedMultiplier = animationStore.speedMultiplier;

    return (
        <div class={cn('@container', props.class)}>
            <Card
                class={cn(
                    cardRoundedMdOnlyClasses,
                    'animation-time g-1 @3xl:grid-cols-[auto_auto_1fr_auto] bottom-0 grid grid-cols-[auto_1fr_auto] flex-row items-center justify-center border-t',
                )}
            >
                <PlayButton />
                <Duration ms={animationStore.msIntoGame()} class="pr-3" />
                <AnimationTimeLine class="@3xl:col-span-1 @3xl:row-auto @3xl:px-0 col-span-3 row-start-2 mx-2" />
                <div class="relative">
                    <Popover>
                        <PopoverTrigger as={Button} variant="ghost">
                            <Times />
                            {Number.isNaN(animationSpeedMultiplier()) ? 0 : animationSpeedMultiplier()}
                        </PopoverTrigger>
                        {/* <PopoverTrigger>abc</PopoverTrigger> */}
                        <PopoverContent class="w-[10rem] p-0">
                            <Index each={[500, 250, 100, 50, 25, 10]}>
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
                                <Times class="absolute left-3 top-[50%] translate-y-[-50%]" />
                                <Input
                                    type="number"
                                    placeholder="Playback speed"
                                    value={animationSpeedMultiplier().toString()}
                                    class="border-none pl-6 outline-none"
                                    onChange={(v) => {
                                        try {
                                            const vv = Number.parseInt(v.target.value);
                                            animationStore.setSpeedMultiplier(vv);
                                        } catch (e) {
                                            // ignore
                                            console.log(e);
                                        }
                                    }}
                                />
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </Card>
        </div>
    );
}

export function renderAnimationOptions(className: string, element: Element) {
    return render(() => <AnimationOptions class={className} />, element);
}
