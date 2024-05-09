import { createEffect, createMemo, untrack } from 'solid-js';
import { animationStore } from './animation-store';
import { createSignal } from '../preact-solid-combat';

export type DisplayVersion = 'v1' | 'vnext';

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

const [displayVersion, setDisplayVersion] = createSignal<DisplayVersion>('vnext');
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

const isV1 = createMemo(() => displayVersion() === 'v1');

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

export const uiStore = {
    mainCardTab,
    mobileTab,
    showMapIfOverview,
    displayVersion,
    setDisplayVersion,
    isV1,
    reset,
    isMainCardTab,
    isMobileTab,
    activateTab,
};

createEffect(() => {
    if (animationStore.isPlaying()) {
        untrack(() => {
            if (mainCardTab() === 'overview') {
                activateTab('map');
            }
        });
    }
});

if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const v = urlParams.get('v');
    setDisplayVersion(v === '1' ? 'v1' : 'vnext');
}
