'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { MatSymbol } from '~/app/_components/mat-symbol';
import { type ParsedRecording } from '~/lib/viz/recording-files/recording';
import { type UseViewOptionsStore } from './_viewOptionsStore';

function zeroPad(num: number, places: number) {
    return String(num).padStart(places, '0');
}

function Times({ className }: { className?: string }) {
    return (
        <span className={cn('text-sm opacity-50', className)} aria-label="times">
            &times;
        </span>
    );
}

function Duration({ ms, className }: { ms: number; className?: string }) {
    const hours = Math.floor(ms / 1000 / 60 / 60);
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    const seconds = Math.floor((ms / 1000) % 60);
    const deciSeconds = Math.floor(Math.floor(ms % 1000) / 100);

    return (
        <Tooltip>
            <TooltipTrigger>
                <span className={cn('font-mono', className)}>
                    {zeroPad(hours, 2)}:{zeroPad(minutes, 2)}
                    <span className="opacity-40">
                        :{zeroPad(seconds, 2)}.{deciSeconds}
                    </span>
                </span>
            </TooltipTrigger>
            <TooltipContent>hh:mm:ss.s</TooltipContent>
        </Tooltip>
    );
}

const intervalMs = 64; // 1000 / 30;

export function AnimationOptions({
    useViewOptionsStore,
    recording,
}: {
    useViewOptionsStore: UseViewOptionsStore;
    recording: ParsedRecording;
}) {
    const isPlaying = useViewOptionsStore((s) => s.isPlaying);
    const togglePlaying = useViewOptionsStore((s) => s.toggleIsPlaying);
    const setIsPlaying = useViewOptionsStore((s) => s.setIsPlaying);
    const animationMsIntoGame = useViewOptionsStore((s) => s.animationMsIntoGame);
    const setAnimationMsIntoGame = useViewOptionsStore((s) => s.setAnimationMsIntoGame);
    const incrementAnimationMsIntoGame = useViewOptionsStore((s) => s.incrementAnimationMsIntoGame);
    const animationSpeedMultiplier = useViewOptionsStore((s) => s.animationSpeedMultiplier);
    const setAnimationSpeedMultiplier = useViewOptionsStore((s) => s.setAnimationSpeedMultiplier);
    const timeFrame = useViewOptionsStore((s) => s.timeFrame);

    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            incrementAnimationMsIntoGame(intervalMs * animationSpeedMultiplier);
        }, intervalMs);

        return () => clearInterval(interval);
    }, [isPlaying, animationSpeedMultiplier, incrementAnimationMsIntoGame]);

    return (
        <Card className="g-1 flex flex-row items-center justify-center">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button onClick={togglePlaying} variant="ghost">
                        <MatSymbol icon={isPlaying ? 'pause' : 'play_arrow'} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>{isPlaying ? 'Pause' : 'Play'}</TooltipContent>
            </Tooltip>

            <Duration ms={animationMsIntoGame} className="pr-3" />

            <Slider
                value={[animationMsIntoGame]}
                min={timeFrame.min}
                max={timeFrame.max}
                step={100}
                className="-my-4 grow py-4"
                onValueChange={(values) => {
                    if (isPlaying) {
                        setIsPlaying(false);
                    }
                    setAnimationMsIntoGame(values[0]!);
                }}
            />
            <div className="relative">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost">
                            <Times />
                            {Number.isNaN(animationSpeedMultiplier) ? 0 : animationSpeedMultiplier}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[10rem] p-0">
                        <Button onClick={() => setAnimationSpeedMultiplier(100)} variant="ghost" className="w-full">
                            <Times />
                            <span>100</span>
                        </Button>
                        <Button onClick={() => setAnimationSpeedMultiplier(50)} variant="ghost" className="w-full">
                            <Times />
                            <span>50</span>
                        </Button>
                        <Button onClick={() => setAnimationSpeedMultiplier(25)} variant="ghost" className="w-full">
                            <Times />
                            <span>25</span>
                        </Button>
                        <Button onClick={() => setAnimationSpeedMultiplier(10)} variant="ghost" className="w-full">
                            <Times />
                            <span>10</span>
                        </Button>
                        <Button onClick={() => setAnimationSpeedMultiplier(1)} variant="ghost" className="w-full">
                            <Times />
                            <span>1</span>
                        </Button>

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
                                        console.log(vv);
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
