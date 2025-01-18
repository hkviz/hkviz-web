import { createContext, createMemo, createSignal, useContext } from 'solid-js';

export type ZoomFollowTarget = 'current-zone' | 'visible-rooms';

export function createMapZoomStore() {
	const [target, setTarget] = createSignal<ZoomFollowTarget>('current-zone');
	const [enabled, setEnabled] = createSignal(true);
	const [transition, setTransition] = createSignal(true);
	const [tempDisabled, setTempDisabled] = createSignal(false);

	const [transitionSpeed, setTransitionSpeed] = createSignal(100);

	const [transform, setTransform] = createSignal({
		offsetX: 0,
		offsetY: 0,
		scale: 1,
	});

	function reset() {
		setTarget('current-zone');
		setEnabled(true);
		setTransition(true);
		setTempDisabled(false);
		setTransitionSpeed(100);
		setTransform({ offsetX: 0, offsetY: 0, scale: 1 });
	}

	const shouldDoTransition = createMemo(() => {
		return enabled() && transition() && !tempDisabled();
	});

	return {
		target,
		setTarget,
		enabled,
		setEnabled,
		transition,
		setTransition,
		tempDisabled,
		setTempDisabled,
		shouldDoTransition,
		transitionSpeed,
		setTransitionSpeed,
		reset,
		transform,
		setTransform,
	};
}
export type MapZoomStore = ReturnType<typeof createMapZoomStore>;
export const MapZoomStoreContext = createContext<MapZoomStore>();
export function useMapZoomStore() {
	const store = useContext(MapZoomStoreContext);
	if (!store) throw new Error('useMapZoomStore must be used within a MapZoomStoreContext.Provider');
	return store;
}
