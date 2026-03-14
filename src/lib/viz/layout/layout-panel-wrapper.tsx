import { Component, JSX, JSXElement } from 'solid-js';
import { cardClasses, cardRoundedMdOnlyClasses } from '~/components/ui/additions/card';
import { ResizablePanel } from '~/components/ui/resizable';
import { cn } from '~/lib/utils';
import { useLayoutPanelContext } from './layout-panel-context';

export const LayoutPanelWrapper: Component<{
	children: JSXElement;
	class?: string;
	style?: JSX.CSSProperties | undefined;
}> = (props) => {
	const panelContext = useLayoutPanelContext();
	const maxSizeRem = () => panelContext.type().maxSizeInRems;

	// const layoutStore = useLayoutStore();
	// function r(n: number | undefined) {
	// 	if (n) return Math.round(n * 100) / 100;
	// 	return n;
	// }

	return (
		<ResizablePanel
			collapsible
			minSize={0.18}
			maxSize={panelContext.maxSizePercent()}
			collapsedSize={panelContext.collapsedSizePercent()}
			class={cn(cardClasses, cardRoundedMdOnlyClasses, 'min-h-11 overflow-hidden border-t', props.class)}
			style={maxSizeRem() ? { 'max-height': `${maxSizeRem()}rem`, ...props.style } : props.style}
		>
			{/* <div class="flex h-0 gap-2 text-sm">
				<span>
					a: {r(layoutStore.getLanePanelSizes(panelContext.layoutLane())?.[panelContext.layoutLaneIndex()])}
				</span>
				<span>
					m: {r(layoutStore.getMaxSizePercent(panelContext.layoutLane(), panelContext.layoutLaneIndex()))}
				</span>
				<span>
					c:{' '}
					{r(layoutStore.getCollapsedSizePercent(panelContext.layoutLane(), panelContext.layoutLaneIndex()))}
				</span>
			</div> */}
			{props.children}
		</ResizablePanel>
	);
};
