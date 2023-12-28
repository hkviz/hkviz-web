import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { format, formatDistance } from 'date-fns';

function AbsoluteDate({ date }: { date: Date }) {
    return <>{format(date, 'yyyy-mm-dd')}</>;
}

export function RelativeDate({ date, withTooltip = true }: { date: Date; withTooltip?: boolean }) {
    const relativeDate = formatDistance(date, new Date(), { addSuffix: true });

    if (!withTooltip) return <>{relativeDate}</>;

    return (
        <Tooltip>
            <TooltipTrigger>
                <span>{relativeDate}</span>
            </TooltipTrigger>
            <TooltipContent>
                <AbsoluteDate date={date} />
            </TooltipContent>
        </Tooltip>
    );
}
