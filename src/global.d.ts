/// <reference types="@solidjs/start/env" />

declare module '*?hero' {
	const img: {
		sources: Record<string, string>;
		img: {
			src: string;
			w: number;
			h: number;
		};
	};
	export default img;
}

declare module '*.mdx' {
	import { Component } from 'solid-js';
	let MDXComponent: Component;
	export default MDXComponent;
}
