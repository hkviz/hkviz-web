import { type CombinedRecording } from '../../parser';
import { useAnimationStore } from './animation-store';
import { useExtraChartStore } from './extra-chart-store';
import { useGameplayStore } from './gameplay-store';
import { useUiStore } from './ui-store';

export function createStoreInitializer() {
	const uiStore = useUiStore();
	const gameplayStore = useGameplayStore();
	const animationStore = useAnimationStore();
	const extraChartStore = useExtraChartStore();

	return {
		reset() {
			uiStore.reset();
		},
		initializeFromRecording(recording: CombinedRecording | null) {
			gameplayStore.setRecording(recording);
			animationStore.setMsIntoGame(gameplayStore.timeFrame().max);
			extraChartStore.setTimeboundsForFollow();
		},
	};
}
