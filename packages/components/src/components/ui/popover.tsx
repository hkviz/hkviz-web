import type { Component, ValidComponent } from 'solid-js';
import { splitProps } from 'solid-js';

import { type PolymorphicProps } from '@kobalte/core/polymorphic';
import { type PopoverContentProps, Popover as PopoverPrimitive, type PopoverRootProps } from '@kobalte/core/popover';

import { cn } from '../../lib';

const Popover: Component<PopoverRootProps> = (props) => {
    return <PopoverPrimitive gutter={4} {...props} />;
};

const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;
const PopoverArrow = PopoverPrimitive.Arrow;

type ContentProps<T extends ValidComponent = 'div'> = PolymorphicProps<T, PopoverContentProps>;

const PopoverContent: Component<ContentProps> = (props) => {
    const [, rest] = splitProps(props, ['class']);
    return (
        <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
                class={cn(
                    'bg-popover text-popover-foreground data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95 z-50 w-72 origin-[var(--kb-popover-content-transform-origin)] rounded-md border p-4 shadow-md outline-none',
                    props.class,
                )}
                {...rest}
            />
        </PopoverPrimitive.Portal>
    );
};

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor, PopoverArrow };
