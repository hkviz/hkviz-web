import { type Component, type JSXElement } from 'solid-js';
import { cn } from '~/lib/utils';

export interface ExpanderProps {
	children: JSXElement;
	expanded: boolean;
	class?: string;
}

export const Expander: Component<ExpanderProps> = (props) => {
	return (
		<div
			class={cn(
				'grid overflow-hidden transition-grid-rows',
				props.class,
				props.expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
			)}
		>
			<div
				class={cn(
					'invisible min-h-0 transition-[opacity,visibility]',
					props.expanded ? 'visible opacity-100' : 'invisible opacity-0',
				)}
			>
				{props.children}
			</div>
		</div>
	);
};
