import { cn } from '@hkviz/components';
import { type JSXElement, Show, type ComponentProps } from 'solid-js';

export type ThemedImageProps = {
    srcLight: ComponentProps<'img'>['src'];
    srcDark: ComponentProps<'img'>['src'];
    class?: string;
    alt: string;
};

export function ThemedImage(props: ThemedImageProps) {
    return (
        <>
            <img alt={props.alt} src={props.srcLight} class={cn('block rounded-md dark:hidden', props.class)} />
            <img alt={props.alt} src={props.srcDark} class={cn('hidden rounded-md dark:block', props.class)} />
        </>
    );
}

export function ImageContainer(props: { children: JSXElement; caption?: JSXElement; class?: string }) {
    return (
        <div class={cn('mx-auto w-fit', props.class)}>
            <div class="group relative">{props.children}</div>
            <Show when={'caption' in props}>
                <ImageCaption>{props.caption}</ImageCaption>
            </Show>
        </div>
    );
}

export function ImageCaption(props: { children: JSXElement }) {
    return <div class="text-center text-sm">{props.children}</div>;
}
