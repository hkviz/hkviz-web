import { splitProps, type Component, type ValidComponent } from 'solid-js';

import { type PolymorphicProps } from '@kobalte/core/polymorphic';
import { Tooltip as TooltipPrimitive, type TooltipContentProps, type TooltipRootProps } from '@kobalte/core/tooltip';

import { cn } from '../../lib';

const Tooltip: Component<TooltipRootProps> = (props) => {
    return <TooltipPrimitive gutter={4} {...props} />;
};

const TooltipTrigger = TooltipPrimitive.Trigger;

type ContentProps<T extends ValidComponent = 'div'> = PolymorphicProps<T, TooltipContentProps>;

const TooltipContent: Component<ContentProps> = (props) => {
    const [, rest] = splitProps(props, ['class']);
    return (
        <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
                class={cn(
                    'bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 z-50 origin-[var(--kb-popover-content-transform-origin)] overflow-hidden rounded-md border px-3 py-1.5 text-sm shadow-md',
                    props.class,
                )}
                {...rest}
            />
        </TooltipPrimitive.Portal>
    );
};

export { Tooltip, TooltipContent, TooltipTrigger };
