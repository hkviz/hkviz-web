import { type Component } from 'solid-js';
import { tabsListTransparentClasses, tabsTriggerTransparentClasses } from '~/components/ui/additions';
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { MainCardTab, useUiStore } from '../store';

export const LargeScreenTabs: Component = () => {
	const uiStore = useUiStore();
	const mainCardTab = uiStore.mainCardTab;
	return (
		<Tabs
			value={mainCardTab()}
			class="absolute top-0 right-0 left-0 z-20 mx-auto hidden w-fit lg:block"
			onChange={(tab: string) => {
				uiStore.activateTab(tab as MainCardTab);
			}}
		>
			<TabsList class={tabsListTransparentClasses}>
				<TabsTrigger value="overview" class={tabsTriggerTransparentClasses}>
					Overview
				</TabsTrigger>
				<TabsTrigger value="map" class={tabsTriggerTransparentClasses + ' map-tab-large-layout'}>
					Map
				</TabsTrigger>
			</TabsList>
		</Tabs>
	);
};
