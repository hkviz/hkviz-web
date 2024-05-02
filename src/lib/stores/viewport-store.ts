import { computed, signal } from '@preact/signals-react';

const visualViewportScale = signal(1);
const windowSize = signal({ width: 1080, height: 1920 });
const isMobileLayout = computed(() => windowSize.value.width < 1024); // tailwind lg breakpoint

if (typeof window !== 'undefined') {
    if ('visualViewport' in window) {
        window.visualViewport!.addEventListener('resize', function () {
            visualViewportScale.value = window.visualViewport!.scale;
        });
    } else {
        console.log('The Visual Viewport API is not supported in this browser.');
    }
}

export const viewportStore = {
    visualViewportScale,
    isMobileLayout,
};

if (typeof window !== 'undefined') {
    function onResize() {
        windowSize.value = {
            width: window.innerWidth,
            height: window.innerHeight,
        };
        console.log('asjdajsdjad', windowSize.value);
    }
    window.addEventListener('resize', onResize);
    onResize();
}
