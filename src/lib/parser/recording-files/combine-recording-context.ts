import { HeroStateField } from '../hero-state/hero-states';
import { PlayerDataField } from '../player-data';
import { RecordingFileVersion } from '../recording-file-version';
import { FrameEndEvent, PlayerPositionEvent, SceneEvent } from './events';
import { PlayerDataEvent } from './events/player-data-event';
import { HeroStateEvent } from './recording';

export class CombineRecordingsContext {
	msIntoGame = 0;
	lastTimestamp: number = 0;

	isPaused = true;
	isTransitioning = false;

	previousPlayerDataEventsByField = new Map<PlayerDataField, PlayerDataEvent<PlayerDataField>>();

	getPreviousPlayerData = <TField extends PlayerDataField>(field: TField) => {
		return this.previousPlayerDataEventsByField.get(field) as PlayerDataEvent<TField> | undefined;
	};

	previousHeroStateByField = new Map<HeroStateField, HeroStateEvent>();
	getPreviousHeroState = (field: HeroStateField) => {
		return this.previousHeroStateByField.get(field);
	};

	createEndFrameEvent = false;

	previousPlayerPositionEvent: PlayerPositionEvent | null = null;
	previousPositionEventWithChangedPosition: PlayerPositionEvent | null = null;
	previousPlayerPositionEventWithMapPosition: PlayerPositionEvent | null = null;
	previousFrameEndEvent: FrameEndEvent | null = null;
	previousSceneEvent: SceneEvent | null = null;

	recordingFileVersion: RecordingFileVersion = '0.0.0';

	visitedScenesToCheckIfInPlayerData = [] as { sceneName: string; msIntoGame: number }[];

	allModVersions = new Map<string, Set<string>>();
	allHkVizModVersions = new Set<string>();

	hasCreatedFirstEndFrameEvent = false;
}
