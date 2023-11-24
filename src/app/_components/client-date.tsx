import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistance } from 'date-fns';
import dynamic from 'next/dynamic';

function NoSSRDate({ date }: { date: Date }) {
    return <>{date.toLocaleDateString()}</>;
}

export const AbsoluteDate = dynamic(() => Promise.resolve(NoSSRDate), {
    ssr: false,
});

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
