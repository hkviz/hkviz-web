import { computed, effect, signal } from '@preact/signals-react';
import { animationStore } from './animation-store';

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

const displayVersion = signal<DisplayVersion>('vnext');
const mainCardTab = signal<MainCardTab>('overview');
const mobileTab = signal<MobileTab>('overview');

function showMapIfOverview() {
    if (mainCardTab.value === 'overview') {
        mainCardTab.value = 'map';
    }
    if (mobileTab.value === 'overview') {
        mobileTab.value = 'map';
    }
}

const isV1 = computed(() => displayVersion.value === 'v1');

function reset() {
    mainCardTab.value = 'overview';
    mobileTab.value = 'overview';
}

export const uiStore = {
    mainCardTab,
    mobileTab,
    showMapIfOverview,
    displayVersion,
    isV1,
    reset,
    isMainCardTab,
    isMobileTab,
};

effect(() => {
    if (animationStore.isPlaying.value && uiStore.mainCardTab.value === 'overview') {
        uiStore.mainCardTab.value = 'map';
    }
});

if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const v = urlParams.get('v');
    displayVersion.value = v === '1' ? 'v1' : 'vnext';
}
