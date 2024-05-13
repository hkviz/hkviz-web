import {
    Tabs,
    TabsList,
    TabsTrigger,
    tabsListTransparentClasses,
    tabsTriggerTransparentClasses,
} from '@hkviz/components';
import { type MainCardTab, uiStore } from '@hkviz/viz';
import { type Component } from 'solid-js';

export const LargeScreenTabs: Component = () => {
    const mainCardTab = uiStore.mainCardTab;
    return (
        <Tabs
            value={mainCardTab()}
            class="absolute left-0 right-0 top-0 z-10 mx-auto hidden w-fit lg:block"
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
