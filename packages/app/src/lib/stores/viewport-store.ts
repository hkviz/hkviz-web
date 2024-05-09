import { viewportStore as viewportStoreSolid } from '@hkviz/viz';
import { computed } from '@preact/signals-react';

const isMobileLayout = computed(() => viewportStoreSolid.windowSize.valuePreact.width < 1024); // tailwind lg breakpoint

export const viewportStore = {
    ...viewportStoreSolid,
    isMobileLayout,
};
