'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useComputed, useSignal, useSignalEffect } from '@preact/signals-react';
import { Pause, Play } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { animationStore } from '~/lib/stores/animation-store';
import { gameplayStore } from '~/lib/stores/gameplay-store';
import { changeRoomColorForDarkTheme, changeRoomColorForLightTheme } from '~/lib/stores/room-coloring-store';
import { roomDisplayStore } from '~/lib/stores/room-display-store';
import { themeStore } from '~/lib/stores/theme-store';
import { useAutoSizeCanvas } from '~/lib/utils/canvas';
import { mainRoomDataBySceneName } from '~/lib/viz/map-data/rooms';
import { type UseViewOptionsStore } from '../../../lib/stores/view-options-store';
import { DurationSignal } from './_duration';

function Times({ className }: { className?: string }) {
    return (
        <span className={cn('text-sm opacity-50', className)} aria-label="times">
            &times;
        </span>
    );
}

const intervalMs = 1000 / 30;
// const intervalMs = 1000 / 60;

function PlayButton({ useViewOptionsStore }: { useViewOptionsStore: UseViewOptionsStore }) {
    const isPlaying = useViewOptionsStore((s) => s.isPlaying);
    const togglePlaying = useViewOptionsStore((s) => s.toggleIsPlaying);
    const isDisabled = useViewOptionsStore((s) => !s.recording);
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button onClick={togglePlaying} variant="ghost" disabled={isDisabled}>
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
            </TooltipTrigger>
            <TooltipContent>{isPlaying ? 'Pause' : 'Play'}</TooltipContent>
        </Tooltip>
    );
}

const EMPTY_ARRAY = [] as const;

function AnimationTimeLineColorCodes({ useViewOptionsStore }: { useViewOptionsStore: UseViewOptionsStore }) {
    const timeFrameMs = useViewOptionsStore((s) => s.timeFrame);
    const setAnimationMsIntoGame = useViewOptionsStore((s) => s.setAnimationMsIntoGame);
    const togglePinnedRoom = useViewOptionsStore((s) => s.togglePinnedRoom);
    const setHoveredRoom = useViewOptionsStore((s) => s.setHoveredRoom);
    const setHoveredMsIntoGame = useViewOptionsStore((s) => s.setHoveredMsIntoGame);
    const setSelectedRoomIfNotPinned = useViewOptionsStore((s) => s.setSelectedRoomIfNotPinned);
    const showMapIfOverview = useViewOptionsStore((s) => s.showMapIfOverview);

    const sceneChanges = useComputed(() => {
        const sceneEvents = gameplayStore.recording.value?.sceneEvents ?? EMPTY_ARRAY;
        const timeframe = gameplayStore.timeframe.value;
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

    useSignalEffect(() => {
        const _sceneChanges = sceneChanges.value;
        const _c = autoSizeCanvas.value;
        const timeframe = gameplayStore.timeframe.value;
        const selectedScene = roomDisplayStore.selectedSceneName.value;
        const selectedZone = roomDisplayStore.selectedRoomZoneFormatted.value;

        if (!_c || !_sceneChanges) return;
        const ctx = _c.canvas?.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, _c.widthInUnits, _c.heightInUnits);

        for (const sceneChange of _sceneChanges) {
            const height =
                sceneChange.mainVirtualScene === selectedScene
                    ? 1
                    : sceneChange.mainRoomData?.zoneNameFormatted === selectedZone
                      ? 0.666
                      : 0.333;

            ctx.fillStyle = sceneChange.color;
            ctx.fillRect(
                (_c.widthInUnits * sceneChange.startMs) / timeframe.max,
                _c.heightInUnits * (1 - height),
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
        setSelectedRoomIfNotPinned(sceneChange.mainVirtualScene);
        setHoveredRoom(sceneChange.mainVirtualScene);
        setHoveredMsIntoGame(sceneChange.startMs);
    }
    function handleClick(e: React.MouseEvent) {
        const sceneChange = getSceneChangeFromMouseEvent(e);
        console.log(sceneChange);
        if (!sceneChange) return;
        setAnimationMsIntoGame(sceneChange.startMs);
        togglePinnedRoom(sceneChange.mainVirtualScene, true);
        showMapIfOverview();
    }
    function handleMouseLeave() {
        setHoveredRoom(null);
        setHoveredMsIntoGame(null);
    }

    return (
        <div
            className="absolute -bottom-4 left-0 h-3 w-full"
            ref={(el) => (container.value = el)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            <span className="absolute -left-3 top-[50%] translate-x-[-100%] translate-y-[-35%] text-[0.6rem]">
                Area
            </span>
            <canvas ref={(el) => (canvas.value = el)} className="absolute inset-0 h-full w-full" />
        </div>
    );
}

function AnimationTimeLineSlider({ useViewOptionsStore }: { useViewOptionsStore: UseViewOptionsStore }) {
    const animationMsIntoGame = useViewOptionsStore((s) => s.animationMsIntoGame);
    const setAnimationMsIntoGame = useViewOptionsStore((s) => s.setAnimationMsIntoGame);
    // const mainCardTab = useViewOptionsStore((s) => s.mainCardTab);
    // const setMainCardTab = useViewOptionsStore((s) => s.setMainCardTab);
    const timeFrame = useViewOptionsStore((s) => s.timeFrame);
    const isDisabled = useViewOptionsStore((s) => !s.recording);
    const showMapIfOverview = useViewOptionsStore((s) => s.showMapIfOverview);

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
                const storeState = useViewOptionsStore.getState();

                const isV1 = storeState.isV1();
                if (!dragRef.current.isDragging) {
                    dragRef.current.isDragging = true;
                    dragRef.current.startedAtMsIntoGame = storeState.animationMsIntoGame;
                    dragRef.current.previousDiff = 0;
                }
                const value = values[0]!;
                const diff = value - dragRef.current.startedAtMsIntoGame!;
                const newDiff = diff - dragRef.current.previousDiff;

                const scale = isShiftPressedRef.current && !isV1 ? 10 : 1;

                const newMsIntoGame = storeState.animationMsIntoGame + newDiff / scale;
                setAnimationMsIntoGame(newMsIntoGame);
                showMapIfOverview();
                console.log('onValueChange', { value, diff });
                dragRef.current.previousDiff = diff;

                if (!isV1 && !storeState.selectedRoomPinned) {
                    const sceneEvent = storeState.recording?.sceneEventFromMs(newMsIntoGame);
                    if (sceneEvent) {
                        storeState.setSelectedRoomIfNotPinned(sceneEvent.getMainVirtualSceneName());
                    }
                }
            }}
            onValueCommit={(values) => {
                dragRef.current.isDragging = false;
                dragRef.current.startedAtMsIntoGame = null;
                dragRef.current.previousDiff = 0;
                console.log('onValueCommit', values);
            }}
        />
    );
}

function AnimationTimeLineDuration() {
    return <DurationSignal ms={animationStore.msIntoGame} className="pr-3" />;
}

// this is in an extra components, so the parent does not need to depend on animationMsIntoGame.
// Which changes very often when animating, rendering is therefore skipped for the siblings and the parent.
export function AnimationTimeLine({ useViewOptionsStore }: { useViewOptionsStore: UseViewOptionsStore }) {
    const hoveredMsIntoGame = useViewOptionsStore((s) => s.hoveredMsIntoGame);
    const timeFrame = useViewOptionsStore((s) => s.timeFrame);
    const isV1 = useViewOptionsStore((s) => s.isV1());

    return (
        <>
            <AnimationTimeLineDuration />
            <div className="relative flex w-full shrink grow flex-col gap-2">
                <div className="-mx-2">
                    <AnimationTimeLineSlider useViewOptionsStore={useViewOptionsStore} />
                </div>
                {!isV1 && hoveredMsIntoGame != null && (
                    <div
                        className="absolute bottom-0 top-0 w-[1px] bg-foreground"
                        style={{ left: (100 * hoveredMsIntoGame) / timeFrame.max + '%' }}
                    ></div>
                )}
                {!isV1 && <AnimationTimeLineColorCodes useViewOptionsStore={useViewOptionsStore} />}
            </div>
        </>
    );
}

export function AnimationOptions({ useViewOptionsStore }: { useViewOptionsStore: UseViewOptionsStore }) {
    const isPlaying = useViewOptionsStore((s) => s.isPlaying);
    const incrementAnimationMsIntoGame = useViewOptionsStore((s) => s.incrementAnimationMsIntoGame);
    const animationSpeedMultiplier = useViewOptionsStore((s) => s.animationSpeedMultiplier);
    const setAnimationSpeedMultiplier = useViewOptionsStore((s) => s.setAnimationSpeedMultiplier);
    const isDisabled = useViewOptionsStore((s) => !s.recording);

    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            incrementAnimationMsIntoGame(intervalMs * animationSpeedMultiplier);
        }, intervalMs);

        return () => clearInterval(interval);
    }, [isPlaying, animationSpeedMultiplier, incrementAnimationMsIntoGame]);

    return (
        <Card className="g-1 bottom-0 flex flex-row items-center justify-center">
            <PlayButton useViewOptionsStore={useViewOptionsStore} />
            <AnimationTimeLine useViewOptionsStore={useViewOptionsStore} />

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
                                onClick={() => setAnimationSpeedMultiplier(it)}
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
                                        setAnimationSpeedMultiplier(vv);
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
    );
}
