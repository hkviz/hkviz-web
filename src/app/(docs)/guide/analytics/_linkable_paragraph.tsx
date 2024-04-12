'use client';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState, type ReactNode } from 'react';

export function LinkableSpan({
    children,
    id,
    className,
    initialScrollMargin,
}: {
    children: ReactNode;
    id: string;
    className?: string;
    initialScrollMargin?: number;
}) {
    const [scrollMargin, setScrollMargin] = useState(initialScrollMargin ?? 0);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        function calcScrollMargin() {
            console.log('calc scroll margin');
            // searches for a tag which is a heading in its parent, and parents parent
            let previousHeading: Element | null = ref.current;
            while (previousHeading && !['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(previousHeading.tagName)) {
                previousHeading =
                    previousHeading.previousElementSibling ??
                    previousHeading.parentElement?.previousElementSibling ??
                    null;
            }

            // if a heading is found, set the scroll margin to the distance between the heading and the linkable paragraph
            const headingRect = previousHeading?.getBoundingClientRect();
            const refRect = ref.current?.getBoundingClientRect();
            if (headingRect && refRect) {
                setScrollMargin(Math.max(refRect.top - headingRect.top, 0));
            }
        }
        calcScrollMargin();

        window.addEventListener('resize', calcScrollMargin);
        return () => {
            window.removeEventListener('resize', calcScrollMargin);
        };
    }, []);

    return (
        <span
            id={id}
            ref={ref}
            className={cn(
                'linkable-paragraph scroll-mt-[var(--scroll-margin-top)] target:bg-amber-400 target:bg-opacity-70 dark:target:bg-opacity-30',
                className,
            )}
            style={
                {
                    scrollMarginTop: `calc(${scrollMargin}px + var(--scroll-margin-top))`,
                } as React.CSSProperties
            }
        >
            {children}
        </span>
    );
}
