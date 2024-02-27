'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import * as d3 from 'd3';
import { Pause, Play } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { useDependableEffect } from '~/lib/viz/depdendent-effect';
import { mainRoomDataBySceneName } from '~/lib/viz/map-data/rooms';
import { Duration } from './_duration';
import { type UseViewOptionsStore } from './_viewOptionsStore';

function Times({ className }: { className?: string }) {
    return (
        <span className={cn('text-sm opacity-50', className)} aria-label="times">
            &times;
        </span>
    );
}

const intervalMs = 1000 / 30;

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
    const recording = useViewOptionsStore((s) => s.recording);
    const setAnimationMsIntoGame = useViewOptionsStore((s) => s.setAnimationMsIntoGame);
    const setSelectedRoom = useViewOptionsStore((s) => s.setSelectedRoom);
    const setHoveredRoom = useViewOptionsStore((s) => s.setHoveredRoom);
    const setSelectedRoomIfNotPinned = useViewOptionsStore((s) => s.setSelectedRoomIfNotPinned);
    const timeFrame = useViewOptionsStore((s) => s.timeFrame);
    const selectedRoom = useViewOptionsStore((s) => s.selectedRoom);
    const selectedZone = useMemo(
        () => (selectedRoom ? mainRoomDataBySceneName.get(selectedRoom)?.zoneNameFormatted : undefined),
        [selectedRoom],
    );

    const sceneEvents = recording?.sceneEvents ?? EMPTY_ARRAY;

    const sceneChanges = useMemo(() => {
        const sceneChanges = sceneEvents.map((it) => ({
            sceneName: it.getMainVirtualSceneName(),
            startMs: it.msIntoGame,
            mainRoomData: mainRoomDataBySceneName.get(it.sceneName),
            durationMs: 0,
        }));
        for (let i = 0; i < sceneChanges.length - 1; i++) {
            sceneChanges[i]!.durationMs = (sceneChanges[i + 1]?.startMs ?? timeFrameMs.max) - sceneChanges[i]!.startMs;
        }
        return sceneChanges;
    }, [sceneEvents, timeFrameMs.max]);

    const parentDivRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const rectsRef = useRef<d3.Selection<SVGRectElement, (typeof sceneChanges)[number], SVGSVGElement, unknown>>();

    const mainSvgEffect = useDependableEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);

        svg.attr('viewBox', `0 0 ${timeFrame.max / 1000} 10000`);

        svg.selectAll('*').remove();
        rectsRef.current = svg
            .selectAll('rect')
            .data(sceneChanges)
            .enter()
            .append('rect')
            .attr('x', (d) => d.startMs / 1000)
            .attr('width', (d) => d.durationMs / 1000)
            .attr('height', 10000)
            .attr('fill', (d) => d.mainRoomData?.color?.formatHex() ?? 'white')
            .attr('data-scene-name', (d) => d.sceneName);
    }, [sceneChanges, timeFrame.max]);

    useEffect(() => {
        if (!rectsRef.current) return;
        rectsRef.current
            // .style('opacity', (d) =>
            //     d.sceneName === selectedRoom ? '1' : d.mainRoomData?.zoneNameFormatted === selectedArea ? '0.75' : '0.5',
            // )
            .attr('y', (d) =>
                d.sceneName === selectedRoom ? 0 : d.mainRoomData?.zoneNameFormatted === selectedZone ? 3333 : 6666,
            );
    }, [selectedRoom, mainSvgEffect, selectedZone]);

    useEffect(() => {
        function containerSizeChanged() {
            if (!parentDivRef.current || !parentDivRef.current) return;

            d3.select(svgRef.current)
                .attr('width', parentDivRef.current.offsetWidth)
                .attr('height', parentDivRef.current.offsetHeight);
        }
        containerSizeChanged();

        const resizeObserver = new ResizeObserver(containerSizeChanged);

        resizeObserver.observe(parentDivRef.current!);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    function getSceneChangeFromMouseEvent(e: React.MouseEvent) {
        if (!parentDivRef.current) return undefined;
        // e = Mouse click event.
        const rect = parentDivRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const ms = timeFrameMs.max * (x / rect.width);
        return sceneChanges.findLast((it) => it.startMs <= ms);
    }

    function handleMouseMove(e: React.MouseEvent) {
        const sceneChange = getSceneChangeFromMouseEvent(e);
        if (!sceneChange) return;
        setSelectedRoomIfNotPinned(sceneChange.sceneName);
        setHoveredRoom(sceneChange.sceneName);
    }
    function handleClick(e: React.MouseEvent) {
        const sceneChange = getSceneChangeFromMouseEvent(e);
        if (!sceneChange) return;
        setAnimationMsIntoGame(sceneChange.startMs);
        setSelectedRoom(sceneChange.sceneName);

        // togglePinnedRoom(sceneChange.sceneName, true);
    }
    function handleMouseLeave() {
        setHoveredRoom(null);
    }

    return (
        <div
            className="absolute -bottom-4 left-0 h-3 w-full"
            ref={parentDivRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            <span className="absolute -left-3 top-[50%] translate-x-[-100%] translate-y-[-35%] text-[0.6rem]">
                Area
            </span>
            <svg ref={svgRef} className="absolute inset-0" preserveAspectRatio="none" />
        </div>
    );
}

function AnimationTimeLineSlider({ useViewOptionsStore }: { useViewOptionsStore: UseViewOptionsStore }) {
    const animationMsIntoGame = useViewOptionsStore((s) => s.animationMsIntoGame);
    const setAnimationMsIntoGame = useViewOptionsStore((s) => s.setAnimationMsIntoGame);
    const mainCardTab = useViewOptionsStore((s) => s.mainCardTab);
    const setMainCardTab = useViewOptionsStore((s) => s.setMainCardTab);
    const timeFrame = useViewOptionsStore((s) => s.timeFrame);
    const isDisabled = useViewOptionsStore((s) => !s.recording);

    return (
        <Slider
            value={[animationMsIntoGame]}
            min={timeFrame.min}
            max={timeFrame.max}
            step={100}
            className="-my-4 grow py-4"
            disabled={isDisabled}
            onValueChange={(values) => {
                setAnimationMsIntoGame(values[0]!);
                if (mainCardTab === 'overview') {
                    setMainCardTab('map');
                }
            }}
        />
    );
}

function AnimationTimeLineDuration({ useViewOptionsStore }: { useViewOptionsStore: UseViewOptionsStore }) {
    const animationMsIntoGame = useViewOptionsStore((s) => s.animationMsIntoGame);
    return <Duration ms={animationMsIntoGame} className="pr-3" withTooltip={false} />;
}

// this is in an extra components, so the parent does not need to depend on animationMsIntoGame.
// Which changes very often when animating, rendering is therefore skipped for the siblings and the parent.
export function AnimationTimeLine({ useViewOptionsStore }: { useViewOptionsStore: UseViewOptionsStore }) {
    const hoveredMsIntoGame = useViewOptionsStore((s) => s.hoveredMsIntoGame);
    const timeFrame = useViewOptionsStore((s) => s.timeFrame);
    const isV1 = useViewOptionsStore((s) => s.isV1());

    return (
        <>
            <AnimationTimeLineDuration useViewOptionsStore={useViewOptionsStore} />
            <div className="relative flex w-full shrink grow flex-col gap-2">
                <AnimationTimeLineSlider useViewOptionsStore={useViewOptionsStore} />
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
