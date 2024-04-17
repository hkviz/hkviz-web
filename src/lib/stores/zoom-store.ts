import { signal } from '@preact/signals-react';

const visualViewportScale = signal(1);

if ('visualViewport' in window) {
    window.visualViewport!.addEventListener('resize', function () {
        visualViewportScale.value = window.visualViewport!.scale;
    });
} else {
    console.log('The Visual Viewport API is not supported in this browser.');
}

export const zoomStore = {
    visualViewportScale,
};
