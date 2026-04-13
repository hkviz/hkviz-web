import { mapDataBySceneNameSilk } from '../game-data/silk-data/map-data-silk';
import { isPlayerDataEventOfFieldSilk } from '../game-data/silk-data/player-data-silk';
import { FrameEndEventSilk } from '../parser/recording-files/events-silk/frame-end-event-silk';
import { CombinedRecordingSilk } from '../parser/recording-files/parser-silk/recording-silk';
import { formatTimeMs } from '../viz';
import { aggregateRecording } from './aggregate-recording-shared';
import {
	AggregatedRunDataSilk,
	createAggregationTimePointCloneSilk,
	createEmptyAggregationSilk,
} from './aggregation-value-silk';

export function getZoneNameFromSceneName(sceneName: string | undefined | null): string | undefined {
	if (!sceneName) return undefined;
	return mapDataBySceneNameSilk.get(sceneName)?.zoneNameFormatted;
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
			} else if (event instanceof FrameEndEventSilk && event.previousFrameEndEvent) {
				if (
					event.healthTotal === 0 &&
					event.previousFrameEndEvent &&
					event.previousFrameEndEvent.healthTotal !== 0
				) {
					addToScenes(currentVirtualScenes, event.msIntoGame, 'deaths', 1);
				}
				// todo handle death changes in currency
				const poolDiff = event.HeroCorpseMoneyPool - event.previousFrameEndEvent.HeroCorpseMoneyPool;
				let geoDiff = event.geo - event.previousFrameEndEvent.geo;
				const dead = event.heroState_dead;

				if (poolDiff != 0) {
					if (dead) {
						geoDiff += event.HeroCorpseMoneyPool;
						console.log('Death geo diff', {
							dead,
							geo: event.geo,
							poolDiff,
							geoDiff,
							previousGeo: event.previousFrameEndEvent.geo,
							HeroCorpseMoneyPool: event.HeroCorpseMoneyPool,
							previousHeroCorpseMoneyPool: event.previousFrameEndEvent.HeroCorpseMoneyPool,
							time: formatTimeMs(event.msIntoGame),
							timeMs: event.msIntoGame,
						});
					} else {
						geoDiff += poolDiff;
						console.log('Non death geo diff', {
							dead,
							geo: event.geo,
							poolDiff,
							geoDiff,
							previousGeo: event.previousFrameEndEvent.geo,
							HeroCorpseMoneyPool: event.HeroCorpseMoneyPool,
							previousHeroCorpseMoneyPool: event.previousFrameEndEvent.HeroCorpseMoneyPool,
							time: formatTimeMs(event.msIntoGame),
							timeMs: event.msIntoGame,
						});
					}
				} else if (geoDiff != 0) {
					console.log('No pool diff geo diff', {
						dead,
						geo: event.geo,
						poolDiff,
						geoDiff,
						previousGeo: event.previousFrameEndEvent.geo,
						HeroCorpseMoneyPool: event.HeroCorpseMoneyPool,
						previousHeroCorpseMoneyPool: event.previousFrameEndEvent.HeroCorpseMoneyPool,
						time: formatTimeMs(event.msIntoGame),
						timeMs: event.msIntoGame,
					});
				}

				if (Math.abs(geoDiff) > 1000) {
					console.warn('Large geo diff', {
						dead,
						geo: event.geo,
						poolDiff,
						geoDiff,
						previousGeo: event.previousFrameEndEvent.geo,
						HeroCorpseMoneyPool: event.HeroCorpseMoneyPool,
						previousHeroCorpseMoneyPool: event.previousFrameEndEvent.HeroCorpseMoneyPool,
						time: formatTimeMs(event.msIntoGame),
						timeMs: event.msIntoGame,
					});
				}

				if (geoDiff < 0) {
					addToScenes(currentVirtualScenes, event.msIntoGame, 'geoSpent', -geoDiff);
				} else if (geoDiff > 0) {
					addToScenes(currentVirtualScenes, event.msIntoGame, 'geoEarned', geoDiff);
				}
			}
		},
	);
}
