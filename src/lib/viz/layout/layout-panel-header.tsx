import { Component, JSXElement } from 'solid-js';
import { cardTitleSmallClasses } from '~/components/ui/additions/card';
import { CardHeader, CardTitle } from '~/components/ui/card';
import { cn } from '~/lib/utils';
import { LayoutPanelSelect } from './layout-panel-select';

export const LayoutPanelHeader: Component<{
	children?: JSXElement;
	resizeOptions?: JSXElement;
}> = (props) => {
	return (
		<CardHeader class={'pt-1 pr-2 pb-1 pl-1'}>
			<CardTitle class={cn(cardTitleSmallClasses, 'flex w-full flex-row items-center justify-between')}>
				<LayoutPanelSelect />
				<div class="flex flex-row items-center gap-1">
					{props.children}
					{props.resizeOptions}
				</div>
			</CardTitle>
		</CardHeader>
	);
};
