import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useComputed, type ReadonlySignal } from '@preact/signals-react';
import { zeroPad } from '~/lib/utils/utils';

export function Duration({
    ms,
    className,
    withTooltip = true,
}: {
    ms: number;
    className?: string;
    withTooltip?: boolean;
}) {
    const hours = Math.floor(ms / 1000 / 60 / 60);
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    const seconds = Math.floor((ms / 1000) % 60);
    const deciSeconds = Math.floor(Math.floor(ms % 1000) / 100);

    const content = (
        <span className={cn('font-mono', className)}>
            {zeroPad(hours, 2)}:{zeroPad(minutes, 2)}
            <span className="opacity-40">
                :{zeroPad(seconds, 2)}.{deciSeconds}
            </span>
        </span>
    );

    if (!withTooltip) {
        return content;
    }

    return (
        <Tooltip>
            <TooltipTrigger>{content}</TooltipTrigger>
            <TooltipContent>hh:mm:ss.s</TooltipContent>
        </Tooltip>
    );
}

export function DurationSignal({
    ms,
    className,
    withTooltip = true,
}: {
    ms: ReadonlySignal<number>;
    className?: string;
    withTooltip?: boolean;
}) {
    const part1 = useComputed(function durationSignal1Computed() {
        const msValue = ms.value;
        const hours = Math.floor(msValue / 1000 / 60 / 60);
        const minutes = Math.floor((msValue / 1000 / 60) % 60);

        return `${zeroPad(hours, 2)}:${zeroPad(minutes, 2)}`;
    });
    const part2 = useComputed(function durationSignal2Computed() {
        const msValue = ms.value;
        const seconds = Math.floor((msValue / 1000) % 60);
        const deciSeconds = Math.floor(Math.floor(msValue % 1000) / 100);

        return `${zeroPad(seconds, 2)}.${deciSeconds}`;
    });

    const content = (
        <span className={cn('font-mono', className)}>
            <>{part1}</>
            <span className="opacity-40">
                :<>{part2}</>
            </span>
        </span>
    );

    if (!withTooltip) {
        return content;
    }

    return (
        <Tooltip>
            <TooltipTrigger>{content}</TooltipTrigger>
            <TooltipContent>hh:mm:ss.s</TooltipContent>
        </Tooltip>
    );
}
