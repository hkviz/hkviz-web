import { createContext, createMemo, createSignal, useContext } from 'solid-js';

export function createViewportStore() {
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

	return {
		windowSize,
		visualViewportScale,
		isMobileLayout,
	};
}

export type ViewportStore = ReturnType<typeof createViewportStore>;
export const ViewportStoreContext = createContext<ViewportStore>();
export function useViewportStore() {
	const store = useContext(ViewportStoreContext);
	if (!store) throw new Error('useViewportStore must be used within a ViewportStoreContext.Provider');
	return store;
}
