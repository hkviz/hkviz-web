import { signal } from '@preact/signals-react';

const visualViewportScale = signal(1);

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
};
