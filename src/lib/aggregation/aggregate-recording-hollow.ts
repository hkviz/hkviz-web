import { mainRoomDataBySceneName } from '../game-data/hollow-data/map-data-hollow';
import { playerDataFieldsHollow } from '../game-data/hollow-data/player-data-hollow';
import { FrameEndEventHollow } from '../parser/recording-files/events-hollow/frame-end-event-hollow';
import { HeroStateEvent } from '../parser/recording-files/events-hollow/hero-state-event';
import { SpellDownEvent } from '../parser/recording-files/events-hollow/spell-down-event';
import { SpellFireballEvent } from '../parser/recording-files/events-hollow/spell-fireball-event';
import { SpellUpEvent } from '../parser/recording-files/events-hollow/spell-up-event';
import {
	CombinedRecordingHollow,
	isPlayerDataEventOfFieldHollow,
} from '../parser/recording-files/parser-hollow/recording-hollow';
import { aggregateRecording } from './aggregate-recording-shared';
import {
	AggregatedRunDataHollow,
	createAggregationTimePointCloneHollow,
	createEmptyAggregationHollow,
} from './aggregation-value-hollow';

export function getZoneNameFromSceneName(sceneName: string | undefined | null): string | undefined {
	if (!sceneName) return undefined;
	const roomData = mainRoomDataBySceneName.get(sceneName);
	return roomData?.zoneNameFormatted;
}

export function aggregateRecordingHollow(recording: CombinedRecordingHollow): AggregatedRunDataHollow {
	return aggregateRecording(
		recording,
		createEmptyAggregationHollow,
		createAggregationTimePointCloneHollow,
		getZoneNameFromSceneName,
		(event, currentVirtualScenes, addToScenes) => {
			if (event instanceof HeroStateEvent && event.field.name === 'dead' && event.value) {
				// counted in frame end event, since deaths in pantheons (and probably dreams) don't trigger heroState dead
				// addToScenes(currentVirtualScenes, 'deaths', 1);
			} else if (event instanceof HeroStateEvent && event.field.name === 'focusing' && event.value) {
				// TODO needs some work, since probably not counting continuous focusing, and also not able to
				// differentiate between successful and unsuccessful focusing
				addToScenes(currentVirtualScenes, event.msIntoGame, 'focusing', 1);
			} else if (event instanceof SpellFireballEvent) {
				addToScenes(currentVirtualScenes, event.msIntoGame, 'spellFireball', 1);
			} else if (event instanceof SpellUpEvent) {
				addToScenes(currentVirtualScenes, event.msIntoGame, 'spellUp', 1);
			} else if (event instanceof SpellDownEvent) {
				addToScenes(currentVirtualScenes, event.msIntoGame, 'spellDown', 1);
			} else if (
				isPlayerDataEventOfFieldHollow(event, playerDataFieldsHollow.byFieldName.health) &&
				event.previousPlayerDataEventOfField
			) {
				const diff = event.value - event.previousPlayerDataEventOfField.value;
				if (diff < 0) {
					addToScenes(currentVirtualScenes, event.msIntoGame, 'damageTaken', -diff);
				}
			} else if (
				isPlayerDataEventOfFieldHollow(event, playerDataFieldsHollow.byFieldName.healthBlue) &&
				event.previousPlayerDataEventOfField
			) {
				const diff = event.value - event.previousPlayerDataEventOfField.value;
				if (diff < 0) {
					addToScenes(currentVirtualScenes, event.msIntoGame, 'damageTaken', -diff);
				}
			} else if (event instanceof FrameEndEventHollow && event.previousFrameEndEvent) {
				if (
					event.healthTotal === 0 &&
					event.previousFrameEndEvent &&
					event.previousFrameEndEvent.healthTotal !== 0
				) {
					addToScenes(currentVirtualScenes, event.msIntoGame, 'deaths', 1);
				}
				// todo handle death changes in currency
				const poolDiff = event.geoPool - event.previousFrameEndEvent.geoPool;
				let geoDiff = event.geo - event.previousFrameEndEvent.geo;
				const dead = event.dead;

				if (poolDiff != 0) {
					if (dead) {
						geoDiff += event.geoPool;
					} else {
						geoDiff += poolDiff;
					}
				}

				if (geoDiff < 0) {
					addToScenes(currentVirtualScenes, event.msIntoGame, 'geoSpent', -geoDiff);
				} else if (geoDiff > 0) {
					addToScenes(currentVirtualScenes, event.msIntoGame, 'geoEarned', geoDiff);
				}

				// --- essence ---
				const essenceDiff = event.dreamOrbs - event.previousFrameEndEvent.dreamOrbs;
				if (essenceDiff < 0) {
					addToScenes(currentVirtualScenes, event.msIntoGame, 'essenceSpent', -essenceDiff);
				} else if (essenceDiff > 0) {
					addToScenes(currentVirtualScenes, event.msIntoGame, 'essenceEarned', essenceDiff);
				}
			}
		},
	);
}
