import { Separator } from '../components/ui';
import { cn } from '../lib';
import { type Component } from 'solid-js';

export const GradientSeparator: Component<{ class?: string }> = (props) => {
    return (
        <Separator
            class={cn(
                'my-4 h-[1px] border-none bg-transparent bg-gradient-to-r from-transparent via-current to-transparent',
                props.class,
            )}
        />
    );
};
