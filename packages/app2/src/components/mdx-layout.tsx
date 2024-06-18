import { cn } from '@hkviz/components';
import { type JSXElement } from 'solid-js';
import { ContentWrapper } from './content-wrapper';
import { MDXProvider } from 'solid-mdx';

export function MdxLayout(props: { children: JSXElement }) {
    // Create any shared layout or styles here
    return (
        <MdxOuterWrapper>
            <MdxInnerWrapper>{props.children}</MdxInnerWrapper>
        </MdxOuterWrapper>
    );
}

export function MdxOuterWrapper(props: { children: JSXElement }) {
    const sharedHeaderClasses =
        'scroll-mt-[var(--scroll-margin-top)] target:bg-amber-400 target:bg-opacity-70 dark:target:bg-opacity-30 -ml-2 px-2 rounded max-w-fit ';

    const largeHeaderClasses = sharedHeaderClasses + ' font-serif';
    const smallHeaderClasses = sharedHeaderClasses + ' font-serifMixedCase';

    return (
        <MDXProvider
            components={{
                h1: (props) => <h1 {...props} class={cn(largeHeaderClasses, props.className)} />,
                h2: (props) => <h2 {...props} class={cn(largeHeaderClasses, props.className, 'mb-[.5em] text-4xl')} />,
                h3: (props) => <h3 {...props} class={cn(largeHeaderClasses, props.className)} />,
                h4: (props) => <h3 {...props} class={cn(smallHeaderClasses, props.className)} />,
                h5: (props) => <h3 {...props} class={cn(smallHeaderClasses, props.className)} />,
                h6: (props) => <h3 {...props} class={cn(smallHeaderClasses, props.className)} />,
            }}
        >
            <ContentWrapper backgroundClass="dark:opacity-40 opacity-20">{props.children}</ContentWrapper>
        </MDXProvider>
    );
}

export function MdxInnerWrapper(props: { children: JSXElement; class?: string }) {
    return (
        <div class={cn('prose dark:prose-invert mx-auto my-[4rem] max-w-[90ch] p-4', props.class)}>
            {props.children}
        </div>
    );
}
