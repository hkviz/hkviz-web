import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

export function BottomInteractionRow({
    children,
    isVisible = true,
    mode = 'sticky',
}: {
    children: ReactNode;
    isVisible?: boolean;

    mode?: 'sticky' | 'fixed';
}) {
    return (
        <div
            className={cn(
                mode + ' bottom-[-1px] left-0 right-0 z-10 border-b border-t bg-background p-3 transition-all',
                isVisible ? 'visible opacity-100' : 'invisible translate-y-10 opacity-0',
            )}
        >
            <div className="mx-auto flex max-w-[800px] flex-row items-center gap-2 ">{children}</div>
        </div>
    );
}

export function BottomInteractionRowText({ children }: { children?: ReactNode }) {
    return <span className="grow">{children}</span>;
}
