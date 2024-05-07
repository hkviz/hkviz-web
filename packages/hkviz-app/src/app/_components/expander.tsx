'use client';

import { cn } from '@/lib/utils';

export function Expander({
    children,
    expanded,
    className,
}: {
    children: React.ReactNode;
    expanded: boolean;
    className?: string;
}) {
    return (
        <div className={cn('grid transition-grid-rows', className, expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
            <div
                className={cn(
                    'invisible min-h-0 transition-[opacity,visibility]',
                    expanded ? 'visible opacity-100' : 'invisible opacity-0',
                )}
            >
                {children}
            </div>
        </div>
    );
}
