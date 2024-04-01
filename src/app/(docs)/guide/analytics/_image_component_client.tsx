'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createContext, useContext, useMemo, useState } from 'react';

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
            <div
                className={
                    'pointer-events-none absolute rounded-md shadow-[0_0_0_100vmax_rgba(0,0,0,0.5)] transition-all duration-100 dark:shadow-[0_0_0_100vmax_rgba(255,255,255,0.35)] ' +
                    (positionClassName ?? 'left-0 top-0 h-full w-full delay-150')
                }
            ></div>
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

    function handleHover() {
        context.set?.(positionClassName);
    }

    function handleUnhover() {
        context.unset?.(positionClassName);
    }

    return (
        <Button
            className={cn(
                'absolute z-20 min-h-0 min-w-0 rounded-sm border-2 border-dashed border-black bg-transparent p-0 text-transparent no-underline opacity-30 drop-shadow-glow-md transition duration-200 ease-in-out hover:bg-transparent hover:bg-opacity-0 group-hover:opacity-100 dark:border-white',
                // 'absolute z-20 rounded-sm border-2 border-red-600 bg-transparent p-0 text-transparent no-underline drop-shadow-glow-md transition duration-200 ease-in-out hover:bg-transparent hover:bg-opacity-0 group-hover:text-red-600 group-hover:opacity-100 dark:border-red-600 dark:drop-shadow-2xl dark:group-hover:text-red-600',
                positionClassName,
            )}
            onMouseEnter={handleHover}
            onMouseLeave={handleUnhover}
            asChild
        >
            <a href={href}>{children}</a>
        </Button>
    );
}
