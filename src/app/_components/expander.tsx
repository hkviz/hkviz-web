import { cn } from '@/lib/utils';

export function Expander({ children, expanded }: { children: React.ReactNode; expanded: boolean }) {
    return (
        <div className={cn('transition-grid-rows grid', expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
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
