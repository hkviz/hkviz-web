import { mapDataMainBySceneNameSilk } from '../game-data/silk-data/map-data-silk';
import { isPlayerDataEventOfFieldSilk } from '../game-data/silk-data/player-data-silk';
import { FrameEndEventSilk } from '../parser/recording-files/events-silk/frame-end-event-silk';
import { CombinedRecordingSilk } from '../parser/recording-files/parser-silk/recording-silk';
import { formatTimeMs } from '../viz/util/time';
import { aggregateRecording } from './aggregate-recording-shared';
import {
	AggregatedRunDataSilk,
	createAggregationTimePointCloneSilk,
	createEmptyAggregationSilk,
} from './aggregation-value-silk';

export function getZoneNameFromSceneName(sceneName: string | undefined | null): string | undefined {
	if (!sceneName) return undefined;
	return mapDataMainBySceneNameSilk.get(sceneName)?.zoneNameFormatted;
}

export function aggregateRecordingSilk(recording: CombinedRecordingSilk): AggregatedRunDataSilk {
	let recentlyRemovedFromPool: number | null = null;
	let recentlyRemovedFromPoolTime: number = 0;

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
			} else if (
				isPlayerDataEventOfFieldSilk(event, 'HeroCorpseMoneyPool') &&
				event.previousPlayerDataEventOfField
			) {
				const diff = event.value - event.previousPlayerDataEventOfField.value;
				if (diff < 0) {
					recentlyRemovedFromPool = -diff;
					recentlyRemovedFromPoolTime = event.msIntoGame;
				}
			} else if (isPlayerDataEventOfFieldSilk(event, 'ShellShards') && event.previousPlayerDataEventOfField) {
				const diff = event.value - event.previousPlayerDataEventOfField.value;
				if (diff > 0) {
					addToScenes(currentVirtualScenes, event.msIntoGame, 'shellShardsEarned', diff);
				} else if (diff < 0) {
					addToScenes(currentVirtualScenes, event.msIntoGame, 'shellShardsSpent', -diff);
				}
			} else if (event instanceof FrameEndEventSilk && event.previousFrameEndEvent) {
				if (
					event.healthTotal === 0 &&
					event.previousFrameEndEvent &&
					event.previousFrameEndEvent.healthTotal !== 0
				) {
					addToScenes(currentVirtualScenes, event.msIntoGame, 'deaths', 1);
				}
				// todo handle death changes in currency
				const geoDiff = event.geo - event.previousFrameEndEvent.geo;

				if (geoDiff > 0) {
					if (
						recentlyRemovedFromPool &&
						recentlyRemovedFromPoolTime &&
						event.msIntoGame - recentlyRemovedFromPoolTime < 100 &&
						geoDiff === recentlyRemovedFromPool
					) {
						// Silksong writes back the removed pool as geo gain in the next frame
						// so we have to keep track of recently removed pool to not count it as geo gain
						recentlyRemovedFromPool = null;
						recentlyRemovedFromPoolTime = 0;
					} else {
						if (geoDiff > 1000) {
							console.warn('Large geo gain diff', {
								geoDiff,
								event,
								time: formatTimeMs(event.msIntoGame),
								timeMs: event.msIntoGame,
							});
						}
						addToScenes(currentVirtualScenes, event.msIntoGame, 'geoEarned', geoDiff);
					}
				} else if (geoDiff < 0) {
					const pool = event.HeroCorpseMoneyPool;
					if (pool === -geoDiff) {
						// just died and lost geo to pool, don't count as geo spent
						console.log('Death geo loss matches pool gain, not counting as geo spent', {
							geoDiff,
							pool,
							event,
							time: formatTimeMs(event.msIntoGame),
							timeMs: event.msIntoGame,
						});
					} else {
						addToScenes(currentVirtualScenes, event.msIntoGame, 'geoSpent', -geoDiff);
					}
				}
			}
		},
	);
}
