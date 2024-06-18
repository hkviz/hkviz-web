import { defineConfig } from '@solidjs/start/config';
import pkg from '@vinxi/plugin-mdx';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import remarkToc from 'remark-toc';

import type { MdxOptions } from '@vinxi/plugin-mdx';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const { default: mdx } = pkg;

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

const mdxOptions: MdxOptions = {
    jsx: true,
    jsxImportSource: 'solid-js',
    providerImportSource: 'solid-mdx',
    remarkPlugins: [[remarkToc, remarkTocOptions], remarkGfm],
    rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, rehypeAutolinkOptions]],
};

export default defineConfig({
    extensions: ['tsx', 'mdx'],
    vite: {
        plugins: [mdx.withImports({})(mdxOptions)],
    },
});
