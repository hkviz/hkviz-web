import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';

export const HelpButton = memo(function HelpButton({ href }: { href: string }) {
    return (
        <Tooltip>
            <TooltipTrigger>
                <Button variant={'ghost'} size={'icon'} className="h-8 w-8 rounded-full p-2" asChild>
                    <Link href={href} target="_blank">
                        <HelpCircle className="h-4 w-4" />
                    </Link>
                </Button>
            </TooltipTrigger>
            <TooltipContent>Open help page</TooltipContent>
        </Tooltip>
    );
});

export function analyticsGuideUrl(hash: string) {
    return `/guide/analytics#${hash}`;
}
