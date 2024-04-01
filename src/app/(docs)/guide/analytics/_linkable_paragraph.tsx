import { type ReactNode } from 'react';

export function LinkableParagraph({ children, id }: { children: ReactNode; id: string }) {
    return (
        <p>
            <span
                id={id}
                className="linkable-paragraph scroll-mt-[var(--scroll-margin-top)] target:bg-amber-400 target:bg-opacity-70 dark:target:bg-opacity-30"
            >
                {children}
            </span>
        </p>
    );
}
