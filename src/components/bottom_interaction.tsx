import { type Component, type JSXElement } from 'solid-js';
import { cn } from '~/lib/utils';

export const BottomInteractionRow: Component<{
	children: JSXElement;
	isVisible?: boolean;
	mode?: 'sticky' | 'fixed';
}> = (props) => {
	return (
		<div
			class={cn(
				props.mode + ' bg-background right-0 -bottom-px left-0 z-10 border-t border-b p-3 transition-all',
				props.isVisible ? 'visible opacity-100' : 'invisible translate-y-10 opacity-0',
			)}
		>
			<div class="mx-auto flex max-w-200 flex-row items-center gap-2">{props.children}</div>
		</div>
	);
};

export const BottomInteractionRowText: Component<{ children?: JSXElement }> = (props) => {
	return <span class="grow">{props.children}</span>;
};
