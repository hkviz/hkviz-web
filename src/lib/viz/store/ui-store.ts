import { createContext, createEffect, createSignal, untrack, useContext } from 'solid-js';

const mainCardTabs = ['overview', 'map'] as const;
const mobileTabs = ['overview', 'map', 'time-charts', 'splits'] as const;

export type MainCardTab = (typeof mainCardTabs)[number];
export type MobileTab = (typeof mobileTabs)[number];

function isMainCardTab(tab: string): tab is MainCardTab {
	return mainCardTabs.includes(tab as MainCardTab);
}

function isMobileTab(tab: string): tab is MobileTab {
	return mobileTabs.includes(tab as MobileTab);
}

export function createUiStore() {
	const [mainCardTab, setMainCardTab] = createSignal<MainCardTab>('overview');
	const [mobileTab, setMobileTab] = createSignal<MobileTab>('overview');

	function showMapIfOverview() {
		if (mainCardTab() === 'overview') {
			setMainCardTab('map');
		}
		if (mobileTab() === 'overview') {
			setMobileTab('map');
		}
	}

	function reset() {
		setMainCardTab('overview');
		setMobileTab('overview');
	}

	function activateTab(tab: MainCardTab | MobileTab) {
		setMobileTab(tab);
		if (isMainCardTab(tab)) {
			setMainCardTab(tab);
		} else {
			setMainCardTab('map');
		}
	}

	return {
		mainCardTab,
		mobileTab,
		showMapIfOverview,
		reset,
		isMainCardTab,
		isMobileTab,
		activateTab,
	};
}

export type UiStore = ReturnType<typeof createUiStore>;
export const UiStoreContext = createContext<UiStore>();
export function useUiStore() {
	const store = useContext(UiStoreContext);
	if (!store) {
		throw new Error('useUiStore must be used within a UiStoreProvider');
	}
	return store;
}
