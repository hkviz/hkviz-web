import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistance } from 'date-fns';

function AbsoluteDate({ date }: { date: Date }) {
    return <>{date.toISOString()}</>;
}

export function RelativeDate({ date }: { date: Date }) {
    const relativeDate = formatDistance(date, new Date(), { addSuffix: true });
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
