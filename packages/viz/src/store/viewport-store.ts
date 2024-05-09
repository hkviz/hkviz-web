import { createMemo } from 'solid-js';
import { createSignal } from '../preact-solid-combat';

const [visualViewportScale, setVisualViewportScale] = createSignal(1);
const [windowSize, setWindowSize] = createSignal({ width: 1080, height: 1920 });
const isMobileLayout = createMemo(() => windowSize().width < 1024); // tailwind lg breakpoint

if (typeof window !== 'undefined') {
    if ('visualViewport' in window) {
        window.visualViewport!.addEventListener('resize', function () {
            setVisualViewportScale(window.visualViewport!.scale);
        });
    } else {
        console.log('The Visual Viewport API is not supported in this browser.');
    }
}

export const viewportStore = {
    windowSize,
    visualViewportScale,
    isMobileLayout,
};

if (typeof window !== 'undefined') {
    function onResize() {
        setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight,
        });
    }
    window.addEventListener('resize', onResize);
    onResize();
}
