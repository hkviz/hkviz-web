import { Component, createMemo, Show } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { useGameplayStore } from '../store/gameplay-store';
import { useLayoutStore } from '../store/layout-store';
import { useLocalizationStore } from '../store/localization-store';
import { useLayoutPanelContext } from './layout-panel-context';
import { getLayoutPanelTypeById, LayoutPanelTypeId, layoutPanelTypesByGame } from './layout-panel-type';

export interface LayoutPanelSelectProps {
	iconOnly?: boolean;
}

export const LayoutPanelSelect: Component<LayoutPanelSelectProps> = (props) => {
	const localizationStore = useLocalizationStore();
	const layoutStore = useLayoutStore();
	const gameplayStore = useGameplayStore();
	const panelContext = useLayoutPanelContext();
	const value = () => panelContext.type().id;
	const setValue = (newValue: LayoutPanelTypeId | undefined | null) => {
		if (!newValue) {
			return;
		}
		layoutStore.selectPanelType(panelContext.layoutLane(), panelContext.layoutLaneIndex(), newValue);
	};

	const options = createMemo(() => {
		const game = gameplayStore.game();
		if (!game) {
			return [];
		}
		return layoutPanelTypesByGame[game]?.filter((type) => type.selectableInSelect).map((type) => type.id) ?? [];
	});

	return (
		<Select
			value={value()}
			onChange={setValue}
			options={options()}
			itemComponent={(props) => (
				<SelectItem item={props.item}>
					<div class="flex items-center">
						<div class="mr-2 flex h-6 w-6 items-center justify-center">
							<Dynamic
								component={getLayoutPanelTypeById(props.item.rawValue)?.icon}
								class="inline-block max-h-6 max-w-6"
							/>
						</div>
						{localizationStore.getString(getLayoutPanelTypeById(props.item.rawValue)?.displayName)}
					</div>
				</SelectItem>
			)}
		>
			<SelectTrigger aria-label="Panel" class="border-0 pl-2">
				<SelectValue<string> class="flex items-center justify-center">
					<Show when={!props.iconOnly}>
						<Show when={panelContext.type().showIconInSelect}>
							<div class="mr-1 flex h-7 w-6 items-center justify-center">
								<Dynamic component={panelContext.type().icon} class="inline-block max-h-7 max-w-6" />
							</div>
						</Show>
						<span class="mr-2 overflow-hidden text-lg font-semibold tracking-tight text-nowrap text-ellipsis">
							{localizationStore.getString(panelContext.type().displayName)}
						</span>
					</Show>
				</SelectValue>
			</SelectTrigger>
			<SelectContent />
		</Select>
	);
};
