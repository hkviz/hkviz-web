/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import('./src/env.mjs');
import withMDX from '@next/mdx';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import remarkToc from 'remark-toc';

/** @type {import("next").NextConfig} */
const config = {
    pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
};

/** @type {import("rehype-autolink-headings").Options} */
const rehypeAutolinkOptions = {
    behavior: 'prepend',
    properties: {
        ariaHidden: true,
        tabIndex: -1,
        className:
            'hash-link text-zinc-400 dark:text-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-200 no-underline p-2 lg:ml-[calc(-1ch-1rem)]',
    },
};

/** @type {import("remark-toc").Options} */
const remarkTocOptions = {
    maxDepth: 3,
};

const configWithMdx = withMDX({
    extension: /\.mdx?$/,
    options: {
        remarkPlugins: [[remarkToc, remarkTocOptions], remarkGfm],
        rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, rehypeAutolinkOptions]],
    },
})(config);

export default configWithMdx;
