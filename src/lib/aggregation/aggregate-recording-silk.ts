import { mapDataBySceneNameLowerSilk } from '../game-data/silk-data/map-data-silk';
import { isPlayerDataEventOfFieldSilk } from '../game-data/silk-data/player-data-silk';
import { CombinedRecordingSilk } from '../parser/recording-files/parser-silk/recording-silk';
import { aggregateRecording } from './aggregate-recording-shared';
import {
	AggregatedRunDataSilk,
	createAggregationTimePointCloneSilk,
	createEmptyAggregationSilk,
} from './aggregation-value-silk';

export function getZoneNameFromSceneName(sceneName: string | undefined | null): string | undefined {
	if (!sceneName) return undefined;
	// TODO remove to lower
	const roomData = mapDataBySceneNameLowerSilk.get(sceneName.toLowerCase());
	console.log('getZoneNameFromSceneName', { sceneName, roomData, z: roomData?.zoneNameFormatted });
	return roomData?.zoneNameFormatted;
}

export function aggregateRecordingSilk(recording: CombinedRecordingSilk): AggregatedRunDataSilk {
	return aggregateRecording(
		recording,
		createEmptyAggregationSilk,
		createAggregationTimePointCloneSilk,
		getZoneNameFromSceneName,
		(event, currentVirtualScenes, addToScenes) => {
			if (isPlayerDataEventOfFieldSilk(event, 'heroState_dead') && event.value) {
				// counted in frame end event, since deaths in pantheons (and probably dreams) don't trigger heroState dead
				// addToScenes(currentVirtualScenes, 'deaths', 1);
			} else if (isPlayerDataEventOfFieldSilk(event, 'heroState_focusing')) {
				// TODO needs some work, since probably not counting continuous focusing, and also not able to
				// differentiate between successful and unsuccessful focusing
				addToScenes(currentVirtualScenes, event.msIntoGame, 'focusing', 1);
			} else if (isPlayerDataEventOfFieldSilk(event, 'health') && event.previousPlayerDataEventOfField) {
				const diff = event.value - event.previousPlayerDataEventOfField.value;
				if (diff < 0) {
					addToScenes(currentVirtualScenes, event.msIntoGame, 'damageTaken', -diff);
				}
			} else if (isPlayerDataEventOfFieldSilk(event, 'healthBlue') && event.previousPlayerDataEventOfField) {
				const diff = event.value - event.previousPlayerDataEventOfField.value;
				if (diff < 0) {
					addToScenes(currentVirtualScenes, event.msIntoGame, 'damageTaken', -diff);
				}
			}
			// else if (event instanceof FrameEndEventSilk && event.previousFrameEndEvent) {
			// 	if (
			// 		event.healthTotal === 0 &&
			// 		event.previousFrameEndEvent &&
			// 		event.previousFrameEndEvent.healthTotal !== 0
			// 	) {
			// 		addToScenes(currentVirtualScenes, event.msIntoGame, 'deaths', 1);
			// 	}
			// 	// todo handle death changes in currency
			// 	const poolDiff = event.geoPool - event.previousFrameEndEvent.geoPool;
			// 	let geoDiff = event.geo - event.previousFrameEndEvent.geo;
			// 	const dead = event.dead;

			// 	if (poolDiff != 0) {
			// 		if (dead) {
			// 			geoDiff += event.geoPool;
			// 		} else {
			// 			geoDiff += poolDiff;
			// 		}
			// 	}

			// 	if (geoDiff < 0) {
			// 		addToScenes(currentVirtualScenes, event.msIntoGame, 'geoSpent', -geoDiff);
			// 	} else if (geoDiff > 0) {
			// 		addToScenes(currentVirtualScenes, event.msIntoGame, 'geoEarned', geoDiff);
			// 	}

			// 	// --- essence ---
			// 	const essenceDiff = event.dreamOrbs - event.previousFrameEndEvent.dreamOrbs;
			// 	if (essenceDiff < 0) {
			// 		addToScenes(currentVirtualScenes, event.msIntoGame, 'essenceSpent', -essenceDiff);
			// 	} else if (essenceDiff > 0) {
			// 		addToScenes(currentVirtualScenes, event.msIntoGame, 'essenceEarned', essenceDiff);
			// 	}
			// }
		},
	);
}
