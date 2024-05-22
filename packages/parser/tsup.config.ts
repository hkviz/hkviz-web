import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    target: 'es2020',
    format: ['esm'],
    splitting: false,
    sourcemap: true,
    clean: false,
    dts: true,
});
