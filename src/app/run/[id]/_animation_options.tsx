'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { PauseIcon, PlayIcon } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { ParsedRecording } from '~/lib/viz/recording-files/recording';
import { UseViewOptionsStore } from './_viewOptionsStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

function zeroPad(num: number, places: number) {
    return String(num).padStart(places, '0');
}

function Duration({ ms, className }: { ms: number; className?: string }) {
    const hours = Math.floor(ms / 1000 / 60 / 60);
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    const seconds = Math.floor((ms / 1000) % 60);
    const deciSeconds = Math.floor(Math.floor(ms % 1000) / 100);

    return (
        <span className={cn('font-mono', className)}>
            {zeroPad(hours, 2)}:{zeroPad(minutes, 2)}
            <span className="opacity-40">
                :{zeroPad(seconds, 2)}.{deciSeconds}
            </span>
        </span>
    );
}

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
    const animationSpeedMultiplier = useViewOptionsStore((s) => s.animationSpeedMultiplier);
    const setAnimationSpeedMultiplier = useViewOptionsStore((s) => s.setAnimationSpeedMultiplier);
    const timeFrame = useViewOptionsStore((s) => s.timeFrame);

    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            const nextMs = animationMsIntoGame + 100 * animationSpeedMultiplier;
            setAnimationMsIntoGame(nextMs);
        }, 100);

        return () => clearInterval(interval);
    }, [isPlaying, animationMsIntoGame, recording, setAnimationMsIntoGame, setIsPlaying, animationSpeedMultiplier]);

    return (
        <Card className="g-1 flex flex-row items-center justify-center">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button onClick={togglePlaying} variant="ghost">
                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
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
                className="-my-4 mr-4 grow py-4"
                onValueChange={(values) => setAnimationMsIntoGame(values[0]!)}
            />
            <Input
                type="number"
                placeholder="Playback speed"
                value={animationSpeedMultiplier.toString()}
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
