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
				props.mode + ' -bottom-px left-0 right-0 z-10 border-b border-t bg-background p-3 transition-all',
				props.isVisible ? 'visible opacity-100' : 'invisible translate-y-10 opacity-0',
			)}
		>
			<div class="mx-auto flex max-w-[800px] flex-row items-center gap-2">{props.children}</div>
		</div>
	);
};

export const BottomInteractionRowText: Component<{ children?: JSXElement }> = (props) => {
	return <span class="grow">{props.children}</span>;
};
