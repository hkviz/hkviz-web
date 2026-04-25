import { batch } from 'solid-js';
import { GameModuleOfGame } from '~/lib/game-module/game-module';
import { CombinedRecordingOfGame } from '~/lib/parser/recording-files/parser-specific/combined-recording';
import { GameId } from '~/lib/types/game-ids';
import { useAnimationStore } from './animation-store';
import { useExtraChartStore } from './extra-chart-store';
import { useGameplayStore } from './gameplay-store';
import { useUiStore } from './ui-store';

export function createStoreInitializer<Game extends GameId>() {
	const uiStore = useUiStore();
	const gameplayStore = useGameplayStore();
	const animationStore = useAnimationStore();
	const extraChartStore = useExtraChartStore();

	return {
		reset() {
			uiStore.reset();
		},
		initializeGameModule(module: GameModuleOfGame<Game>) {
			gameplayStore.setGameModule(module);
		},
		initializeFromRecording(module: GameModuleOfGame<Game>, recording: CombinedRecordingOfGame<Game> | null) {
			batch(() => {
				gameplayStore.setGameModule(module);
				gameplayStore.setRecording(recording);
				animationStore.setMsIntoGame(gameplayStore.timeFrame().max, 'instant');
				extraChartStore.setTimeboundsForFollow();
			});
		},
	};
}
