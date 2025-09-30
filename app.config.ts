import { defineConfig } from '@solidjs/start/config';
import type { MdxOptions } from '@vinxi/plugin-mdx';
import pkg from '@vinxi/plugin-mdx';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import remarkToc from 'remark-toc';
import lqip from 'vite-plugin-lqip';
// import { imagetoolsWithAverageColor } from './image-processing';
import type { Node } from 'unist';
import { visit } from 'unist-util-visit';
import { imagetools } from 'vite-imagetools';
// import devtools from 'solid-devtools/vite';
import { assetpackPlugin } from './assetpack-plugin';

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

const mdxOptions: MdxOptions = {
	jsx: true,
	jsxImportSource: 'solid-js',
	providerImportSource: 'solid-mdx',
	remarkPlugins: [[remarkToc, remarkTocOptions], remarkGfm, addTargetToHashLinks],
	rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, rehypeAutolinkOptions]],
};

export default defineConfig({
	extensions: ['tsx', 'mdx'],
	server: {
		preset: "cloudflare-pages",
		rollupConfig: {
			external: ["__STATIC_CONTENT_MANIFEST", "node:async_hooks", "cloudflare:sockets", "nodemailer"],
		},
	},
	vite: {
		plugins: [
			//devtools({
				/* features options - all disabled by default */
			//	autoname: true, // e.g. enable autoname
			//}),
			mdx.withImports({})(mdxOptions),
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
						return new URLSearchParams(
							'w=1200;800;600;400;300&format=webp;jpg&as=picture&withoutEnlargement',
						);
					}
					return new URLSearchParams();
				},
			}),
			assetpackPlugin(),
		]
	},
	middleware: './src/middleware.ts',
});
