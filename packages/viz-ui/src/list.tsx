import { cn } from '@hkviz/components';
import { type ColorClasses } from '@hkviz/viz';
import { type Component, type JSXElement } from 'solid-js';

export const Ul: Component<{ children: JSXElement; class?: string }> = (props) => {
    return <ul class={cn('pl-0', props.class)}>{props.children}</ul>;
};

export const Li: Component<{ children: JSXElement; color: ColorClasses }> = (props) => {
    return (
        <li
            class={
                'ml-6 list-none border-b py-1 before:-ml-6 before:mr-3.5 before:inline-block before:h-2.5 before:w-2.5 before:rounded-full before:content-[""] last:border-b-0 ' +
                props.color.beforeBackground
            }
        >
            {props.children}
        </li>
    );
};
