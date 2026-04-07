import { Component, JSXElement } from 'solid-js';

export function SelectIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="size-4 opacity-50"
		>
			<path d="M8 9l4 -4l4 4" />
			<path d="M16 15l-4 4l-4 -4" />
		</svg>
	);
}

export const SelectItemBody: Component<{ children: JSXElement; class?: string }> = (props) => {
	return <div class="flex flex-col">{props.children}</div>;
};

export const SelectItemHeader: Component<{ children: JSXElement; class?: string }> = (props) => {
	return <span class="flex flex-row items-center">{props.children}</span>;
};

export const SelectItemDescription: Component<{ children: JSXElement; class?: string }> = (props) => {
	return <span class="block text-xs text-muted-foreground">{props.children}</span>;
};

export const selectItemIconClasses = 'w-3 h-3 mr-2';
