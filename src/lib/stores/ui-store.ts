import { computed, effect, signal } from '@preact/signals-react';
import { animationStore } from './animation-store';

export type DisplayVersion = 'v1' | 'vnext';
export type MainCardTab = 'overview' | 'map';

const displayVersion = signal<DisplayVersion>('vnext');
const mainCardTab = signal<MainCardTab>('overview');

function showMapIfOverview() {
    if (mainCardTab.value === 'overview') {
        mainCardTab.value = 'map';
    }
}

const isV1 = computed(() => displayVersion.value === 'v1');

function reset() {
    mainCardTab.value = 'overview';
}

export const uiStore = {
    mainCardTab,
    showMapIfOverview,
    displayVersion,
    isV1,
    reset,
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
