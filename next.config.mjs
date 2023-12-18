/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import('./src/env.mjs');
import withMDX from '@next/mdx';
import remarkToc from 'remark-toc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

/** @type {import("next").NextConfig} */
const config = {
    pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
};

const configWithMdx = withMDX({
    extension: /\.mdx?$/,
    options: {
        remarkPlugins: [remarkToc],
        rehypePlugins: [
            rehypeSlug,
            [
                rehypeAutolinkHeadings,
                {
                    behaviour: 'append',
                    properties: {
                        ariaHidden: true,
                        tabIndex: -1,
                        className: 'hash-link',
                    },
                },
            ],
        ],
    },
})(config);

export default configWithMdx;
