import { solidStart } from '@solidjs/start/config';
import { defineConfig, Plugin } from 'vite';
// import { imagetoolsWithAverageColor } from './image-processing';
import mdx from '@mdx-js/rollup';
import { nitro } from 'nitro/vite';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import remarkToc from 'remark-toc';
import type { Node } from 'unist';
import { visit } from 'unist-util-visit';
import { imagetools } from 'vite-imagetools';
import lqip from 'vite-plugin-lqip';
import { assetpackPlugin } from './assetpack-plugin';
// import assetpackPlugin from 'vite-plugin-asset-pack';
// import devtools from 'solid-devtools/vite';
// import { imagetoolsWithAverageColor } from './image-processing';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
//const { default: mdx } = pkg;

/** @type {import("rehype-autolink-headings").Options} */
const rehypeAutolinkOptions = {
	behavior: 'prepend',
	properties: {
		ariaHidden: true,
		tabIndex: -1,
		className:
			'hash-link opacity-50 hover:text-zinc-800 dark:hover:text-zinc-200 no-underline p-2 lg:ml-[calc(-1ch-1rem)]',
		target: '_self',
	},
};

/** @type {import("remark-toc").Options} */
const remarkTocOptions = {
	maxDepth: 3,
};

// plugin to add _self to all # links, so the target is correctly set, and can be styled
const addTargetToHashLinks = () => (tree: any) => {
	// similar to https://github.com/rjanjic/remark-link-rewrite/blob/main/src/index.js
	const nodes: Node[] = [];
	visit(tree, (node: Node) => {
		if (node.type === 'link') {
			nodes.push(node);
		}
		if (node.type === 'jsx' || node.type === 'html') {
			if (/<a.*>/.test((node as any).value)) {
				nodes.push(node);
			}
		}
	});

	nodes.forEach((node) => {
		const url = (node as any).url || (node as any).value.match(/href="([^"]*)"/)?.[1];
		if (url && url.startsWith('#')) {
			node.data = node.data || {};
			(node.data as any).hProperties = (node.data as any).hProperties || {};
			(node.data as any).hProperties.target = '_self';
		}
	});
};

type MdxOptions = Parameters<typeof mdx>[0];

const mdxOptions: MdxOptions = {
	jsx: true,
	jsxImportSource: 'solid-js',
	providerImportSource: 'solid-mdx',
	remarkPlugins: [[remarkToc, remarkTocOptions], remarkGfm, addTargetToHashLinks],
	rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, rehypeAutolinkOptions]],
};

export default defineConfig(() => ({
	envDir: './',
	plugins: [
		{
			...mdx(mdxOptions),
			enforce: 'pre',
		} as Plugin,
		solidStart({
			middleware: './src/middleware.ts',
			extensions: ['mdx', 'md'],
		}),
		nitro(),
		/*devtools({
			// features options - all disabled by default
			autoname: true, // e.g. enable autoname
		}),*/
		lqip({
			sharp: {
				resize: {
					width: 16,
					height: 16,
					fit: 'inside',
					kernel: 'cubic',
				},
			},
		}),
		imagetools({
			defaultDirectives: (id) => {
				if (id.searchParams.has('hero')) {
					// the `hero` directive was set on the image
					return new URLSearchParams('w=1200;800;600;400;300&format=webp;jpg&as=picture&withoutEnlargement');
				}
				return new URLSearchParams();
			},
		}),
		assetpackPlugin(),
	],
	nitro: {
		compatibilityDate: '2026-04-01' as any,
		preset: 'cloudflare_module',
		exportConditions: ['worker'],
		cloudflare: {
			wrangler: {
				observability: {
					logs: {
						enabled: true,
						invocation_logs: true,
					},
					traces: {},
				},
			},
		},
	},
	build: {
		rollupOptions: {
			external: ['fs', 'fs/promises', 'fsevents'],
		},
	},
}));
