'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function Video({
    width,
    height,
    srcLight,
    srcDark,
    className,
}: {
    width: number;
    height: number;
    srcLight: string;
    srcDark: string;
    className?: string;
}) {
    const lightVideoRef = useRef<HTMLVideoElement>(null);
    const darkVideoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(true);

    async function handleClick() {
        if (isPlaying) {
            lightVideoRef.current?.pause();
            darkVideoRef.current?.pause();
        } else {
            await Promise.all([lightVideoRef.current?.play(), darkVideoRef.current?.play()]);
        }
    }

    function updateIsPlaying() {
        setIsPlaying(lightVideoRef.current?.paused === false || darkVideoRef.current?.paused === false);
    }

    useEffect(() => {
        updateIsPlaying();
    }, []);

    const sharedClassName = 'relative m-0 pointer-events-none';

    return (
        <Button
            className="group relative h-fit w-fit overflow-hidden rounded-md bg-white p-0 dark:bg-black"
            onClick={handleClick}
        >
            <video
                width={width}
                height={height}
                loop={true}
                autoPlay={true}
                muted={true}
                playsInline={true}
                className={cn(sharedClassName + 'block dark:hidden', className)}
                ref={lightVideoRef}
                onPlay={updateIsPlaying}
                onPause={updateIsPlaying}
                tabIndex={-1}
            >
                <source src={srcLight} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <video
                width={width}
                height={height}
                loop={true}
                autoPlay={true}
                muted={true}
                playsInline={true}
                className={cn(sharedClassName + 'left-2 top-[-1px] hidden dark:block', className)}
                ref={darkVideoRef}
                onPlay={updateIsPlaying}
                onPause={updateIsPlaying}
                tabIndex={-1}
            >
                <source src={srcDark} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            {!isPlaying && <Play className="absolute bottom-3 right-3 h-5 w-5 text-foreground" />}
        </Button>
    );
}
