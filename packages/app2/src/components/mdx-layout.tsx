import { cn } from '@hkviz/components';
import { type JSXElement } from 'solid-js';
import { ContentWrapper } from './content-wrapper';

export function MdxLayout(props: { children: JSXElement }) {
    // Create any shared layout or styles here
    return (
        <MdxOuterWrapper>
            <MdxInnerWrapper>{props.children}</MdxInnerWrapper>
        </MdxOuterWrapper>
    );
}

export function MdxOuterWrapper(props: { children: JSXElement }) {
    return <ContentWrapper backgroundClassName="dark:opacity-40 opacity-20">{props.children}</ContentWrapper>;
}

export function MdxInnerWrapper(props: { children: JSXElement; class?: string }) {
    return (
        <div class={cn('prose dark:prose-invert mx-auto my-[4rem] max-w-[90ch] p-4', props.class)}>
            {props.children}
        </div>
    );
}
