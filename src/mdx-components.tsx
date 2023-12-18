import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
    const headerClasses =
        'scroll-mt-[calc(0.5rem+var(--main-nav-height,0))] font-serif target:bg-amber-400 target:bg-opacity-70 dark:target:bg-opacity-30 -mx-2 px-2 rounded max-w-fit';

    return {
        ...components,
        h1: (props) => <h1 className={headerClasses} {...props} />,
        h2: (props) => <h2 className={headerClasses} {...props} />,
        h3: (props) => <h3 className={headerClasses} {...props} />,
    };
}
