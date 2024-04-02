'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createContext, useContext, useId, useMemo, useState } from 'react';

export const ImageAreaShadowContext = createContext<{
    set?: (positionClassName: string) => void;
    unset?: (positionClassName: string) => void;
}>({});

export function ImageAreaShadow({ children }: { children: React.ReactNode }) {
    const [positionClassName, setPositionClassName] = useState<string | null>(null);

    function unsetPositionClassName(className: string) {
        setPositionClassName((value) => (value === className ? null : value));
    }

    const contextValue = useMemo(() => ({ set: setPositionClassName, unset: unsetPositionClassName }), []);

    return (
        <ImageAreaShadowContext.Provider value={contextValue}>
            <div className="absolute inset-0 overflow-hidden rounded-md">
                <div
                    className={
                        'pointer-events-none absolute rounded-md shadow-[0_0_0_100vmax_rgba(0,0,0,0.5)] transition-all duration-100 dark:shadow-[0_0_0_100vmax_rgba(255,255,255,0.35)] ' +
                        (positionClassName ?? 'left-0 top-0 h-full w-full delay-150')
                    }
                ></div>
            </div>
            {children}
        </ImageAreaShadowContext.Provider>
    );
}

export function ImageArea({
    positionClassName,
    children,
    href,
}: {
    positionClassName: string;
    children: React.ReactNode;
    href: string;
}) {
    const context = useContext(ImageAreaShadowContext);
    const id = useId();

    function handleHover() {
        context.set?.(positionClassName);
    }

    function handleUnhover() {
        context.unset?.(positionClassName);
    }

    return (
        <div>
            {' '}
            <Button
                className={cn(
                    'peer absolute min-h-0 min-w-0 rounded-sm border-2 border-dashed border-black bg-transparent p-0 no-underline opacity-30 drop-shadow-glow-md transition duration-200 ease-in-out hover:bg-transparent hover:bg-opacity-0 group-hover:opacity-100 dark:border-white',
                    // 'absolute z-20 rounded-sm border-2 border-red-600 bg-transparent p-0 text-transparent no-underline drop-shadow-glow-md transition duration-200 ease-in-out hover:bg-transparent hover:bg-opacity-0 group-hover:text-red-600 group-hover:opacity-100 dark:border-red-600 dark:drop-shadow-2xl dark:group-hover:text-red-600',
                    positionClassName,
                )}
                onFocus={handleHover}
                onBlur={handleUnhover}
                onMouseEnter={handleHover}
                onMouseLeave={handleUnhover}
                asChild
                aria-describedby={'tooltip' + id}
            >
                <a href={href}></a>
            </Button>
            <span
                id={'tooltip' + id}
                className="pointer-events-none absolute left-[50%] top-[-0.25rem] z-20 w-max translate-x-[-50%] translate-y-[-100%] scale-75 rounded-md border bg-popover px-3 py-2 text-center text-sm text-popover-foreground  opacity-0 shadow-md transition peer-hover:scale-100 peer-hover:opacity-100"
            >
                {children}
            </span>
        </div>
    );
}
