import { createHotkey } from '@tanstack/solid-hotkeys';
import { createContext, createMemo, createSignal, useContext } from 'solid-js';
import { assertNever } from '~/lib/parser/util/other';

export type ZoomFollowTarget = 'current-area' | 'current-area-smooth' | 'visible-rooms';
export type ZoomFollowType = 'off' | ZoomFollowTarget;

export function createMapZoomStore() {
	const [target, setTarget] = createSignal<ZoomFollowTarget>('current-area-smooth');
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
		setTarget('current-area-smooth');
		setEnabled(true);
		setTransition(true);
		setTempDisabled(false);
		setTransitionSpeed(100);
		setTransform({ offsetX: 0, offsetY: 0, scale: 1 });
	}

	const shouldDoTransition = createMemo(() => {
		return enabled() && transition() && !tempDisabled();
	});

	const state = createMemo<ZoomFollowType>(() => {
		if (!enabled()) return 'off';
		return target();
	});

	function setState(newState: ZoomFollowType) {
		console.log('Setting zoom follow state to', newState);
		if (newState === 'off') {
			setEnabled(false);
		} else {
			setTarget(newState);
			setEnabled(true);
		}
	}

	function cycleStateNoOff() {
		if (!enabled()) {
			setEnabled(true);
		} else {
			const _target = target();
			switch (_target) {
				case 'visible-rooms':
					setTarget('current-area-smooth');
					break;
				case 'current-area-smooth':
					setTarget('current-area');
					break;
				case 'current-area':
					setTarget('visible-rooms');
					break;
				default:
					assertNever(_target);
			}
		}
	}

	function toggleState(newState: ZoomFollowType) {
		if (newState === state()) {
			setState('off');
		} else {
			setState(newState);
		}
	}

	createHotkey(
		'Z',
		() => {
			cycleStateNoOff();
		},
		{
			requireReset: false,
		},
	);

	// createHotkey(
	// 	'1',
	// 	() => {
	// 		setEnabled(true);
	// 		setTarget('current-area');
	// 	},
	// 	() => ({
	// 		enabled: isZHold(),
	// 	}),
	// );

	// createHotkey(
	// 	'2',
	// 	() => {
	// 		setEnabled(true);
	// 		setTarget('visible-rooms');
	// 	},
	// 	() => ({
	// 		enabled: isZHold(),
	// 	}),
	// );

	// createHotkey(
	// 	'3',
	// 	() => {
	// 		setEnabled(false);
	// 	},
	// 	() => ({
	// 		enabled: isZHold(),
	// 	}),
	// );

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
		state,
		setState,
		toggleState,
	};
}
export type MapZoomStore = ReturnType<typeof createMapZoomStore>;
export const MapZoomStoreContext = createContext<MapZoomStore>();
export function useMapZoomStore() {
	const store = useContext(MapZoomStoreContext);
	if (!store) throw new Error('useMapZoomStore must be used within a MapZoomStoreContext.Provider');
	return store;
}
