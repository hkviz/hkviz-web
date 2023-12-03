import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { format, formatDistance } from 'date-fns';

function AbsoluteDate({ date }: { date: Date }) {
    return <>{format(date, 'yyyy-mm-dd')}</>;
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
