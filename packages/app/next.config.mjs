/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import('./src/env.mjs');
import withMDX from '@next/mdx';
import path from 'path';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import remarkToc from 'remark-toc';

/** @type {import("next").NextConfig} */
const config = {
    pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
    // eslint-disable-next-line @typescript-eslint/require-await
    async headers() {
        // no cache for user study
        return [
            {
                source: '/user-study/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-store',
                    },
                ],
            },
            {
                source: '/experience',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-store',
                    },
                ],
            },
            {
                source: '/study-demographic-form',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-store',
                    },
                ],
            },
        ];
    },
    webpack: (config, { isServer, dev }) => {
        // Add this to tell webpack to include solid-js/web correctly
        const p = (pa) => path.resolve(pa);

        const type = isServer ? 'server' : dev ? 'dev' : null;

        config.resolve.alias['solid-js/web'] =
            type === 'server'
                ? p('./solid-js-server-dist-hack.js')
                : p('./node_modules/solid-js/web/dist/' + (type || 'web') + '.js');
        config.resolve.alias['solid-js/store'] = p('./node_modules/solid-js/store/dist/' + (type || 'store') + '.js');
        config.resolve.alias['solid-js'] = p('./node_modules/solid-js/dist/' + (type || 'solid') + '.js');

        config.resolve.alias['@hkviz/viz-ui'] = p('./node_modules/@hkviz/viz-ui/dist/' + (type || 'index') + '.js');
        config.resolve.alias['@hkviz/components'] = p(
            './node_modules/@hkviz/components/dist/' + (type || 'index') + '.js',
        );

        // Return the altered config
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return config;
    },
    typescript: {},
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
