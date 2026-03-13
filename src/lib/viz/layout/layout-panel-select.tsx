import { Component, Show } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { useLayoutStore } from '../store/layout-store';
import { useLayoutPanelContext } from './layout-panel-context';
import { getLayoutPanelTypeById, LayoutPanelTypeId, layoutPanelTypeIds } from './layout-panel-type';

export const LayoutPanelSelect: Component = () => {
	const layoutStore = useLayoutStore();
	const panelContext = useLayoutPanelContext();
	const value = () => panelContext.type().id;
	const setValue = (newValue: LayoutPanelTypeId | undefined | null) => {
		if (!newValue) {
			return;
		}
		layoutStore.selectPanelType(panelContext.layoutLane(), panelContext.layoutLaneIndex(), newValue);
	};

	return (
		<Select
			value={value()}
			onChange={setValue}
			options={layoutPanelTypeIds}
			itemComponent={(props) => (
				<SelectItem item={props.item} class="flex items-center">
					<Dynamic
						component={getLayoutPanelTypeById(props.item.rawValue)?.icon}
						class="mr-2 inline-block h-6"
					/>
					{getLayoutPanelTypeById(props.item.rawValue)?.displayName}
				</SelectItem>
			)}
		>
			<SelectTrigger aria-label="Panel" class="border-0 pl-2">
				<SelectValue<string> class="flex items-center justify-center">
					<Show when={panelContext.type().showIconInSelect}>
						<Dynamic component={panelContext.type().icon} class="mr-1 inline-block w-6" />
					</Show>
					<span class="mr-2 text-lg font-semibold tracking-tight">{panelContext.type().displayName}</span>
				</SelectValue>
			</SelectTrigger>
			<SelectContent />
		</Select>
	);
};
