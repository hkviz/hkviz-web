import { cn } from '@/lib/utils';
import { type ColorClasses } from '@hkviz/viz';

export function Ul({ children, className }: { children: React.ReactNode; className?: string }) {
    return <ul className={cn('pl-0', className)}>{children}</ul>;
}

export function Li({ children, color }: { children: React.ReactNode; color: ColorClasses }) {
    return (
        <li
            className={
                'ml-6 list-none border-b py-1 before:-ml-6 before:mr-3.5 before:inline-block before:h-2.5 before:w-2.5 before:rounded-full before:content-[""] last:border-b-0 ' +
                color.beforeBackground
            }
        >
            {children}
        </li>
    );
}
