import { defineConfig } from '@solidjs/start/config';
// @ts-expect-error (2339) Cannot find module '@vinxi/plugin-mdx'
import pkg from '@vinxi/plugin-mdx';

const { default: mdx } = pkg;

export default defineConfig({
    extensions: ['tsx', 'mdx'],
    vite: {
        plugins: [
            mdx.withImports({})({
                jsx: true,
                jsxImportSource: 'solid-js',
                providerImportSource: 'solid-mdx',
            }),
        ],
    },
});
