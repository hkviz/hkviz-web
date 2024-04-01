import { cn } from '@/lib/utils';
import type { MDXComponents } from 'mdx/types';
import Image from 'next/image';
import { ebGaramond } from './styles/fonts';

export function useMDXComponents(components: MDXComponents): MDXComponents {
    const sharedHeaderClasses =
        'scroll-mt-[var(--scroll-margin-top)] target:bg-amber-400 target:bg-opacity-70 dark:target:bg-opacity-30 -ml-2 px-2 rounded max-w-fit ';

    const largeHeaderClasses = sharedHeaderClasses + ' font-serif';
    const smallHeaderClasses = sharedHeaderClasses + ebGaramond.className;

    return {
        ...components,
        h2: (props) => <h2 {...props} className={cn(largeHeaderClasses, props.className)} />,
        h1: (props) => <h1 {...props} className={cn(largeHeaderClasses, props.className)} />,
        h3: (props) => <h3 {...props} className={cn(largeHeaderClasses, props.className)} />,
        h4: (props) => <h3 {...props} className={cn(smallHeaderClasses, props.className)} />,
        h5: (props) => <h3 {...props} className={cn(smallHeaderClasses, props.className)} />,
        h6: (props) => <h3 {...props} className={cn(smallHeaderClasses, props.className)} />,

        // needed for some reason, otherwise there is a prop type error
        // eslint-disable-next-line jsx-a11y/alt-text
        Image: (props: React.ComponentProps<typeof Image>) => <Image {...props} />,
    };
}
