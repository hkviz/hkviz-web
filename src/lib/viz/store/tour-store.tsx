import { createContext, createMemo, createSignal, untrack, useContext } from 'solid-js';
import { createTourSteps } from '../tour/steps';
import { RoomColoringStore } from './room-coloring-store';
import { RoomDisplayStore } from './room-display-store';
import { ViewportStore } from './viewport-store';

export function hkMapRoomRectClass({ gameObjectName }: { gameObjectName: string }) {
	return 'hk-map-room-react_' + gameObjectName;
}

export function createTourStore(
	roomColoringStore: RoomColoringStore,
	roomDisplayStore: RoomDisplayStore,
	viewportStore: ViewportStore,
) {
	const tourLength = 10;
	const [currentStepIndex, setCurrentStepIndex] = createSignal<number>(-1);
	const isOpen = createMemo(() => currentStepIndex() !== -1);

	function changeCurrentStepIndex(index: number) {
		untrack(() => {
			if (index === currentStepIndex()) return;

			setCurrentStepIndex(index);
		});
	}

	function close() {
		changeCurrentStepIndex(-1);
	}

	function next() {
		untrack(() => {
			const _currentStepIndex = currentStepIndex();

			if (_currentStepIndex + 1 >= tourLength) {
				close();
				return;
			} else {
				changeCurrentStepIndex(_currentStepIndex + 1);
			}
		});
	}

	function back() {
		untrack(() => {
			const _currentStepIndex = currentStepIndex();
			if (_currentStepIndex === 0) {
				close();
			} else {
				changeCurrentStepIndex(_currentStepIndex - 1);
			}
		});
	}

	function startTour() {
		changeCurrentStepIndex(0);
	}

	const steps = createTourSteps({ next, back, roomColoringStore, roomDisplayStore, viewportStore });

	return {
		currentStepIndex,
		isOpen,
		close,
		next,
		back,
		startTour,
		tourLength,
		steps,
	};
}
export type TourStore = ReturnType<typeof createTourStore>;
export const TourStoreContext = createContext<TourStore>();

export function useTourStore() {
	const store = useContext(TourStoreContext);
	if (!store) {
		throw new Error('TourStore not in context!');
	}
	return store;
}
