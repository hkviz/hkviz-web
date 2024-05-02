'use client';

import { cardRoundedMdOnlyClasses } from '@/components/additions/cards';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useComputed, useSignal, useSignalEffect } from '@preact/signals-react';
import { useSignals } from '@preact/signals-react/runtime';
import { Pause, Play } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { animationStore } from '~/lib/stores/animation-store';
import { gameplayStore } from '~/lib/stores/gameplay-store';
import { hoverMsStore } from '~/lib/stores/hover-ms-store';
import { changeRoomColorForDarkTheme, changeRoomColorForLightTheme } from '~/lib/stores/room-coloring-store';
import { roomDisplayStore } from '~/lib/stores/room-display-store';
import { themeStore } from '~/lib/stores/theme-store';
import { uiStore } from '~/lib/stores/ui-store';
import { useAutoSizeCanvas } from '~/lib/utils/canvas';
import { signalRef } from '~/lib/utils/signal-ref';
import { mainRoomDataBySceneName } from '~/lib/viz/map-data/rooms';
import { DurationSignal } from './_duration';

function Times({ className }: { className?: string }) {
    return (
        <span className={cn('text-sm opacity-50', className)} aria-label="times">
            &times;
        </span>
    );
}

function PlayButton() {
    useSignals();
    const isPlaying = animationStore.isPlaying.value;
    const isDisabled = !gameplayStore.recording.value;
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button onClick={animationStore.togglePlaying} variant="ghost" disabled={isDisabled}>
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
            </TooltipTrigger>
            <TooltipContent>{isPlaying ? 'Pause' : 'Play'}</TooltipContent>
        </Tooltip>
    );
}

const EMPTY_ARRAY = [] as const;

function AnimationTimeLineColorCodes() {
    useSignals();
    const timeFrameMs = gameplayStore.timeFrame.value;

    const sceneChanges = useComputed(function timelineColorCodesSceneChangesComputed() {
        const sceneEvents = gameplayStore.recording.value?.sceneEvents ?? EMPTY_ARRAY;
        const timeframe = gameplayStore.timeFrame.value;
        const theme = themeStore.currentTheme.value;
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

    const canvas = useSignal<HTMLCanvasElement | null>(null);
    const container = useSignal<HTMLDivElement | null>(null);

    const autoSizeCanvas = useAutoSizeCanvas(container, canvas);

    useSignalEffect(function drawTimelineColorCodesEffect() {
        const _sceneChanges = sceneChanges.value;
        const _c = autoSizeCanvas.value;
        const timeframe = gameplayStore.timeFrame.value;
        const selectedScene = roomDisplayStore.selectedSceneName.value;
        const selectedZone = roomDisplayStore.selectedRoomZoneFormatted.value;

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

    function getSceneChangeFromMouseEvent(e: React.MouseEvent) {
        const _sceneChanges = sceneChanges.value;
        if (!container.value) return undefined;
        const rect = container.value.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const ms = timeFrameMs.max * (x / rect.width);
        return _sceneChanges.findLast((it) => it.startMs <= ms);
    }

    function handleMouseMove(e: React.MouseEvent) {
        const sceneChange = getSceneChangeFromMouseEvent(e);
        if (!sceneChange) return;
        roomDisplayStore.setSelectedRoomIfNotPinned(sceneChange.mainVirtualScene);
        roomDisplayStore.setHoveredRoom(sceneChange.mainVirtualScene);
        hoverMsStore.setHoveredMsIntoGame(sceneChange.startMs);
    }
    function handleClick(e: React.MouseEvent) {
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
            className="animation-timeline-color-codes absolute bottom-0 left-2.5 right-2.5 h-3"
            ref={signalRef(container)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            <span className="absolute -left-3 top-[50%] hidden translate-x-[-100%] translate-y-[-35%] text-[0.6rem] @3xl:block">
                Area
            </span>
            <canvas ref={signalRef(canvas)} className="absolute inset-0 h-full w-full" />
        </div>
    );
}

function AnimationTimeLineSlider() {
    useSignals();
    const animationMsIntoGame = animationStore.msIntoGame.value;
    const timeFrame = gameplayStore.timeFrame.value;
    const isDisabled = !gameplayStore.recording.value;

    const isShiftPressedRef = useRef(false);

    const dragRef = useRef({
        isDragging: false,
        startedAtMsIntoGame: null as null | number,
        previousDiff: 0,
    });
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Shift') {
                if (isShiftPressedRef.current) return;
                isShiftPressedRef.current = true;
            }
        }
        function handleKeyUp(e: KeyboardEvent) {
            if (e.key === 'Shift') {
                if (!isShiftPressedRef.current) return;
                isShiftPressedRef.current = false;
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    });

    return (
        <Slider
            value={[animationMsIntoGame]}
            min={timeFrame.min}
            max={timeFrame.max}
            step={100}
            className="-my-4 grow py-4"
            disabled={isDisabled}
            onValueChange={(values) => {
                const isV1 = uiStore.isV1.value;
                if (!dragRef.current.isDragging) {
                    dragRef.current.isDragging = true;
                    dragRef.current.startedAtMsIntoGame = animationStore.msIntoGame.value;
                    dragRef.current.previousDiff = 0;
                }
                const value = values[0]!;
                const diff = value - dragRef.current.startedAtMsIntoGame!;
                const newDiff = diff - dragRef.current.previousDiff;

                const scale = isShiftPressedRef.current && !isV1 ? 10 : 1;

                const newMsIntoGame = animationStore.msIntoGame.value + newDiff / scale;
                animationStore.setMsIntoGame(newMsIntoGame);
                uiStore.showMapIfOverview();
                dragRef.current.previousDiff = diff;

                if (!isV1 && !roomDisplayStore.selectedScenePinned.value) {
                    const sceneEvent = gameplayStore.recording.value?.sceneEventFromMs(newMsIntoGame);
                    if (sceneEvent) {
                        roomDisplayStore.setSelectedRoomIfNotPinned(sceneEvent.getMainVirtualSceneName());
                    }
                }
            }}
            onValueCommit={() => {
                dragRef.current.isDragging = false;
                dragRef.current.startedAtMsIntoGame = null;
                dragRef.current.previousDiff = 0;
            }}
        />
    );
}

function AnimationTimeLineDuration() {
    return <DurationSignal ms={animationStore.msIntoGame} className="pr-3" />;
}

// this is in an extra components, so the parent does not need to depend on animationMsIntoGame.
// Which changes very often when animating, rendering is therefore skipped for the siblings and the parent.
export function AnimationTimeLine({ className }: { className?: string }) {
    useSignals();
    const hoveredMsIntoGame = hoverMsStore.hoveredMsIntoGame.value;
    const timeFrame = gameplayStore.timeFrame.value;
    const isV1 = uiStore.isV1.value;

    return (
        <div className={cn('relative flex h-5 shrink grow flex-col gap-2 @3xl:h-10 @3xl:justify-center', className)}>
            <div>
                <AnimationTimeLineSlider />
            </div>
            {!isV1 && (
                <div className="pointer-events-none absolute bottom-0 left-2.5 right-2.5 top-0">
                    {hoveredMsIntoGame != null && (
                        <div
                            className="absolute bottom-0 top-0 w-[1px] bg-foreground"
                            style={{ left: (100 * hoveredMsIntoGame) / timeFrame.max + '%' }}
                        ></div>
                    )}
                </div>
            )}
            {!isV1 && <AnimationTimeLineColorCodes />}
        </div>
    );
}

export function AnimationOptions({ className }: { className?: string }) {
    useSignals();
    const animationSpeedMultiplier = animationStore.speedMultiplier.value;
    const isDisabled = !gameplayStore.recording.value;

    return (
        <div className={cn('@container', className)}>
            <Card
                className={cn(
                    cardRoundedMdOnlyClasses,
                    'animation-time g-1 bottom-0 grid grid-cols-[auto_1fr_auto] flex-row items-center justify-center border-t @3xl:grid-cols-[auto_auto_1fr_auto]',
                )}
            >
                <PlayButton />
                <AnimationTimeLineDuration />
                <AnimationTimeLine className="col-span-3 row-start-2 mx-2 @3xl:col-span-1 @3xl:row-auto @3xl:px-0" />

                <div className="relative">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" disabled={isDisabled}>
                                <Times />
                                {Number.isNaN(animationSpeedMultiplier) ? 0 : animationSpeedMultiplier}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[10rem] p-0">
                            {[500, 250, 100, 50, 25, 10].map((it) => (
                                <Button
                                    onClick={() => (animationStore.speedMultiplier.value = it)}
                                    variant="ghost"
                                    className="w-full"
                                    key={it}
                                >
                                    <Times />
                                    <span>{it}</span>
                                </Button>
                            ))}

                            <div className="relative w-full">
                                <Times className="absolute left-3 top-[50%] translate-y-[-50%]" />
                                <Input
                                    type="number"
                                    placeholder="Playback speed"
                                    value={animationSpeedMultiplier.toString()}
                                    className="border-none pl-6 outline-none"
                                    onChange={(v) => {
                                        try {
                                            const vv = Number.parseInt(v.target.value);
                                            animationStore.speedMultiplier.value = vv;
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
                {/* <Select
                className="grow-0"
                value={animationSpeedMultiplier.toString()}
                onValueChange={(v) => setAnimationSpeedMultiplier(Number.parseInt(v))}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Playback speed" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="1">1x</SelectItem>
                    <SelectItem value="10">10x</SelectItem>
                    <SelectItem value="100">100x</SelectItem>
                </SelectContent>
            </Select> */}
            </Card>
        </div>
    );
}
