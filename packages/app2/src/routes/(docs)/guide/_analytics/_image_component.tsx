import { cn } from '@hkviz/components';
import { type ComponentProps, Show, type JSXElement } from 'solid-js';
import { Image, type OptimizedImageSrc } from '~/components/image';

export type ThemedImageProps = {
    srcLight: OptimizedImageSrc;
    srcDark: OptimizedImageSrc;
    class?: string;
    alt: string;
    sizes?: ComponentProps<typeof Image>['sizes'];
};

export function ThemedImage(props: ThemedImageProps) {
    return (
        <>
            <Image
                alt={props.alt}
                src={props.srcLight}
                class={cn('block rounded-md dark:hidden', props.class)}
                sizes={props.sizes}
            />
            <Image
                alt={props.alt}
                src={props.srcDark}
                class={cn('hidden rounded-md dark:block', props.class)}
                sizes={props.sizes}
            />
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
