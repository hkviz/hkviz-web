import { Component, JSX, JSXElement } from 'solid-js';
import { cardClasses, cardRoundedMdOnlyClasses } from '~/components/ui/additions/card';
import { ResizablePanel } from '~/components/ui/resizable';
import { cn } from '~/lib/utils';

export const LayoutPanelWrapper: Component<{
	children: JSXElement;
	class?: string;
	style?: string | JSX.CSSProperties | undefined;
}> = (props) => {
	return (
		<ResizablePanel
			collapsible
			minSize={0.18}
			class={cn(cardClasses, cardRoundedMdOnlyClasses, 'min-h-11 overflow-hidden border-t', props.class)}
			style={props.style}
		>
			{props.children}
		</ResizablePanel>
	);
};
