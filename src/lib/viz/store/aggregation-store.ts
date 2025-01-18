import { createContext, createMemo, createSignal, useContext } from 'solid-js';
import {
	FrameEndEvent,
	HeroStateEvent,
	SceneEvent,
	SpellDownEvent,
	SpellFireballEvent,
	SpellUpEvent,
	assertNever,
	binarySearchLastIndexBefore,
	isPlayerDataEventOfField,
	playerDataFields,
	roomGroupNamesBySceneName,
	type CombinedRecording,
} from '../../parser';
import { formatTimeMs } from '../util';
import { animationStore } from './animation-store';
import { gameplayStore } from './gameplay-store';
import { RoomDisplayStore } from './room-display-store';

export interface ValueAggregation {
	deaths: number;
	focusing: number;
	spellFireball: number;
	spellUp: number;
	spellDown: number;
	damageTaken: number;
	geoEarned: number;
	geoSpent: number;
	timeSpendMs: number;
	firstVisitMs: number;
	visits: number;
}

export interface ValueAggregationTimePoint extends ValueAggregation {
	msIntoGame: number;
	isActiveScene: boolean;
}

const createEmptyAggregation = (): ValueAggregation => ({
	deaths: 0,
	focusing: 0,
	spellFireball: 0,
	spellUp: 0,
	spellDown: 0,
	damageTaken: 0,
	geoEarned: 0,
	geoSpent: 0,
	timeSpendMs: 0,
	firstVisitMs: 0,
	visits: 0,
});

const createAggregationTimePointClone = (
	aggregation: ValueAggregationTimePoint | undefined,
	msIntoGame: number,
	isActiveScene: boolean,
): ValueAggregationTimePoint => ({
	deaths: aggregation?.deaths ?? 0,
	focusing: aggregation?.focusing ?? 0,
	spellFireball: aggregation?.spellFireball ?? 0,
	spellUp: aggregation?.spellUp ?? 0,
	spellDown: aggregation?.spellDown ?? 0,
	damageTaken: aggregation?.damageTaken ?? 0,
	geoEarned: aggregation?.geoEarned ?? 0,
	geoSpent: aggregation?.geoSpent ?? 0,
	timeSpendMs: aggregation?.timeSpendMs ?? 0,
	firstVisitMs: aggregation?.firstVisitMs ?? 0,
	visits: aggregation?.visits ?? 0,
	msIntoGame,
	isActiveScene,
});

function isAggregationTimepoint(
	aggregation: ValueAggregation | ValueAggregationTimePoint,
): aggregation is ValueAggregationTimePoint {
	return 'msIntoGame' in aggregation;
}

export type AggregationVariable = keyof ValueAggregation;

export type AggregatedRunData = ReturnType<typeof aggregateRecording>;

export const aggregationVariableInfos: {
	[key in AggregationVariable]: {
		name: string;
		description: string;
		format?: (value: number) => string;
	};
} = {
	visits: {
		name: 'Visits',
		description: 'Number of times this scene has been entered.',
	},
	firstVisitMs: {
		name: 'First visited at',
		description: 'Time of first visit',
		format: formatTimeMs,
	},
	timeSpendMs: {
		name: 'Time spent',
		description: 'Total time spent in a scene of all visits combined.',
		format: formatTimeMs,
	},
	damageTaken: {
		name: 'Damage taken',
		description: 'Total damage taken in masks',
	},
	deaths: {
		name: 'Deaths',
		description: 'Number of times the player died in a scene.',
	},
	focusing: {
		name: 'Focusing',
		description: 'Number of times the player started to focus.',
	},
	spellFireball: {
		name: 'Vengeful Spirit',
		description: 'Number of times the player used a fireball spell.',
	},
	spellDown: {
		name: 'Desolate Dive',
		description: 'Number of times the player used a downwards spell.',
	},
	spellUp: {
		name: 'Howling Wraiths',
		description: 'Number of times the player used an upwards spell.',
	},
	geoEarned: {
		name: 'Geo earned',
		description: 'Does not include geo earned by defeating the shade.',
	},
	geoSpent: {
		name: 'Geo spent',
		description: 'Does not include Geo lost by dying and not defeating the shade.',
	},
};

export const aggregationVariables = Object.keys(aggregationVariableInfos) as AggregationVariable[];

export function formatAggregatedVariableValue(variable: AggregationVariable, value: number) {
	const varInfo = aggregationVariableInfos[variable];
	return 'format' in varInfo && varInfo.format ? varInfo.format(value) : value;
}

// type AggregationStoreValue = Record<RunId, AggregatedRunData>;

export function aggregateRecording(recording: CombinedRecording) {
	const countPerScene: Record<string, ValueAggregation> = {};
	const countPerSceneOverTime: Record<string, ValueAggregationTimePoint[]> = {};
	const maxOverScenes: ValueAggregation = createEmptyAggregation();

	let countOfTimePoints = 0;

	function addToScenes(
		virtualScenes: readonly string[],
		msIntoGame: number,
		key: AggregationVariable,
		value: number,
	) {
		virtualScenes.forEach((sceneOrGroupName) => {
			// total of scene
			let totalsOfScene: ValueAggregation = countPerScene[sceneOrGroupName];
			if (!totalsOfScene) {
				totalsOfScene = countPerScene[sceneOrGroupName] = createEmptyAggregation();
			}
			totalsOfScene[key] += value;

			// over time of scene
			const allOverTime =
				sceneOrGroupName in countPerSceneOverTime
					? countPerSceneOverTime[sceneOrGroupName]
					: (countPerSceneOverTime[sceneOrGroupName] = []);

			const last = allOverTime.at(-1);
			let current: ValueAggregationTimePoint;
			if (last && last.msIntoGame === msIntoGame) {
				current = last;
			} else {
				current = createAggregationTimePointClone(last, msIntoGame, true);
				countOfTimePoints++;
				allOverTime.push(current);
				if (last && last.isActiveScene) {
					// here we could also add msIntoGame - last.msIntoGame to timeSpendMs
					// however, we could have more rounding issues, so we always go from the start of the visit to current time.
					const msSpent =
						msIntoGame -
						currentSceneEnteredAtMs +
						currentSceneEnteredWithMsSpendPerVirtualScene.get(sceneOrGroupName)!;

					// if (currentSceneEvent?.sceneName === 'Town') {
					// 	console.log(`${formatTimeMs(msSpent)}`);
					// }

					current.timeSpendMs = msSpent;
					totalsOfScene.timeSpendMs = msSpent;
				}
			}
			current[key] += value;

			// max total over all scenes
			maxOverScenes[key] = Math.max(maxOverScenes[key], totalsOfScene[key]);
			maxOverScenes.timeSpendMs = Math.max(maxOverScenes.timeSpendMs, totalsOfScene.timeSpendMs);
		});
	}

	let currentSceneEvent: SceneEvent | null = null;
	let currentVirtualScenes: string[] = [];
	let currentSceneEnteredAtMs = 0;
	const currentSceneEnteredWithMsSpendPerVirtualScene: Map<string, number> = new Map();
	// let previousScene

	const x = [] as any[];

	function calculateCurrentVirtualScenes() {
		const groups = currentSceneEvent ? (roomGroupNamesBySceneName.get(currentSceneEvent.sceneName) ?? []) : [];
		currentVirtualScenes = [
			...(currentSceneEvent ? [currentSceneEvent.sceneName] : []),
			...groups.map((it) => it),
		].flatMap((it) => {
			if (currentSceneEvent?.currentBossSequence) {
				return [
					it,
					`group_boss_seq:${currentSceneEvent.currentBossSequence.name}`,
					`boss_seq:${currentSceneEvent.currentBossSequence.name}:${it}`,
				];
			} else {
				return [it];
			}
		});
	}

	function currentVirtualScenesChanged({
		msIntoGame,
		previousVirtualScenes,
	}: {
		msIntoGame: number;
		previousVirtualScenes: string[];
	}) {
		x.push(formatTimeMs(msIntoGame) + ' ' + currentVirtualScenes.join(','));
		if (previousVirtualScenes) {
			// addToScenes(
			// 	previousVirtualScenes,
			// 	event.msIntoGame,
			// 	'timeSpendMs',
			// 	event.msIntoGame - previousSceneEnteredAtMs,
			// );

			// call add just so new time points are created for which active scene is set to false
			addToScenes(previousVirtualScenes, msIntoGame, 'visits', 0);
		}

		for (const previousVirtualScene of previousVirtualScenes) {
			if (!currentVirtualScenes.includes(previousVirtualScene)) {
				// set isActiveScene to false
				const allOverTime = countPerSceneOverTime[previousVirtualScene];
				if (allOverTime) {
					const last = allOverTime.at(-1);
					if (last && last.isActiveScene) {
						last.isActiveScene = false;
						// const addedMsSpent = event.msIntoGame - last.msIntoGame;
						// const totalsOfScene = countPerScene[previousVirtualScene];
						// if (totalsOfScene) {
						// 	totalsOfScene.timeSpendMs += addedMsSpent;
						// }
					}
				}
			}
		}

		currentSceneEnteredAtMs = msIntoGame;
		currentSceneEnteredWithMsSpendPerVirtualScene.clear();
		for (const virtualScene of currentVirtualScenes) {
			const virtualSceneAsArr = [virtualScene];

			currentSceneEnteredWithMsSpendPerVirtualScene.set(
				virtualScene,
				countPerScene[virtualScene]?.timeSpendMs ?? 0,
			);

			if (!countPerScene[virtualScene]?.firstVisitMs) {
				addToScenes(virtualSceneAsArr, msIntoGame, 'firstVisitMs', msIntoGame);
			}
			if (!previousVirtualScenes.includes(virtualScene)) {
				// only counts visit when not already in virtual scene before
				addToScenes(virtualSceneAsArr, msIntoGame, 'visits', 1);
			}
		}
	}

	for (const event of recording.events) {
		if (event instanceof SceneEvent) {
			currentSceneEvent = event;
			const previousVirtualScenes = currentVirtualScenes;
			calculateCurrentVirtualScenes();
			currentVirtualScenesChanged({
				msIntoGame: event.msIntoGame,
				previousVirtualScenes,
			});
		} else if (event instanceof HeroStateEvent && event.field.name === 'dead' && event.value) {
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
			isPlayerDataEventOfField(event, playerDataFields.byFieldName.health) &&
			event.previousPlayerDataEventOfField
		) {
			const diff = event.value - event.previousPlayerDataEventOfField.value;
			if (diff < 0) {
				addToScenes(currentVirtualScenes, event.msIntoGame, 'damageTaken', -diff);
			}
		} else if (
			isPlayerDataEventOfField(event, playerDataFields.byFieldName.healthBlue) &&
			event.previousPlayerDataEventOfField
		) {
			const diff = event.value - event.previousPlayerDataEventOfField.value;
			if (diff < 0) {
				addToScenes(currentVirtualScenes, event.msIntoGame, 'damageTaken', -diff);
			}
		} else if (event instanceof FrameEndEvent && event.previousFrameEndEvent) {
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
				// console.log({
				//     poolDiff,
				//     geoDiff,
				//     dead,
				//     formatTimeMs: formatTimeMs(event.msIntoGame),
				//     currentVirtualScenes: currentVirtualScenes.join(','),
				// });
				if (dead) {
					geoDiff += event.geoPool;
				} else {
					geoDiff += poolDiff;
				}
			}

			// if (event.geoPool && event.geoPool != event.previousFrameEndEvent.geoPool) {
			//     // died again
			//     diff += event.previousFrameEndEvent.geoPool;
			// }

			if (geoDiff < 0) {
				addToScenes(currentVirtualScenes, event.msIntoGame, 'geoSpent', -geoDiff);
			} else if (geoDiff > 0) {
				addToScenes(currentVirtualScenes, event.msIntoGame, 'geoEarned', geoDiff);
			}
		}
	}

	if (currentSceneEvent) {
		const lastMsIntoGame = recording.lastEvent().msIntoGame;
		// addToScenes(currentVirtualScenes, lastMsIntoGame, 'timeSpendMs', lastMsIntoGame - previousSceneEnteredAtMs);
		const previousVirtualScenes = currentVirtualScenes;
		currentVirtualScenes = [];
		currentVirtualScenesChanged({
			msIntoGame: lastMsIntoGame,
			previousVirtualScenes,
		});
	}

	console.log('Created', countOfTimePoints, 'room time points in aggregation store', countPerSceneOverTime);

	// console.log({ countPerScene, maxOverScenes });
	// console.log(x);

	return { countPerScene, maxOverScenes, countPerSceneOverTime };
}

export type AggregationCountMode = 'total' | 'until-current-time';
export const aggregationCountModes = ['until-current-time', 'total'] as AggregationCountMode[];
export function getAggregationCountModeLabel(mode: AggregationCountMode) {
	if (mode === 'total') return 'Stats of complete gameplay';
	if (mode === 'until-current-time') return 'Stats until selected time';
	assertNever(mode);
}

export function createAggregationStore(roomDisplayStore: RoomDisplayStore) {
	const aggregations = createMemo(() => {
		const recording = gameplayStore.recording();
		if (!recording) return null;
		return aggregateRecording(recording);
	});

	const [viewNeverHappenedAggregations, setViewNeverHappenedAggregations] = createSignal(false);

	const [aggregationCountMode, setAggregationCountMode] = createSignal<AggregationCountMode>('until-current-time');

	function getAggregations(sceneName: string): ValueAggregation | null {
		// console.log('getAggregations', sceneName);
		const aggregations_ = aggregations();
		if (!aggregations_) return null;
		const mode = aggregationCountMode();
		if (mode === 'total') return aggregations_.countPerScene[sceneName];
		if (mode === 'until-current-time') {
			const timePoints = aggregations_.countPerSceneOverTime[sceneName];
			if (!timePoints) return null;
			const msIntoGame = animationStore.msIntoGame();
			const currentIndex = binarySearchLastIndexBefore(timePoints, msIntoGame, (it) => it.msIntoGame);
			return currentIndex !== -1 ? (timePoints[currentIndex] ?? null) : null;
		}

		assertNever(mode);
	}

	const visibleRoomAggregations = createMemo(() => {
		const sceneName = roomDisplayStore.selectedSceneName();
		if (!sceneName) return null;
		console.log('visibleRoomAggregations', sceneName, animationStore.msIntoGame());
		return getAggregations(sceneName);
	});

	function getCorrectedAggregationValue(
		aggregation: ValueAggregation | null,
		variable: AggregationVariable,
		msIntoGame: () => number,
	): number | null {
		if (!aggregation) return null;
		const value = aggregation[variable];
		if (variable === 'timeSpendMs' && isAggregationTimepoint(aggregation) && aggregation.isActiveScene) {
			return value + msIntoGame() - aggregation.msIntoGame;
		} else {
			return value;
		}
	}

	return {
		data: aggregations,
		getAggregations,
		viewNeverHappenedAggregations,
		setViewNeverHappenedAggregations,
		visibleRoomAggregations,
		aggregationCountMode,
		setAggregationCountMode,
		getCorrectedAggregationValue,
	};
}
export type AggregationStore = ReturnType<typeof createAggregationStore>;

export const AggregationStoreContext = createContext<AggregationStore>();

export function useAggregationStore() {
	const store = useContext(AggregationStoreContext);
	if (!store) throw new Error('No AggregationStoreContext provided');
	return store;
}
