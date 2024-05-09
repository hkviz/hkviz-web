import { uiStore as solidUiStore } from '@hkviz/viz';
import { computed } from '@preact/signals-react';

const isV1 = computed(() => solidUiStore.displayVersion.valuePreact === 'v1');

export const uiStore = {
    ...solidUiStore,
    isV1,
};
