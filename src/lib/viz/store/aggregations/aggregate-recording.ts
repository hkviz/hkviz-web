import { FrameEndEvent } from '~/lib/parser/recording-files/events-hollow/frame-end-event';
import { HeroStateEvent } from '~/lib/parser/recording-files/events-hollow/hero-state-event';
import { SceneEvent } from '~/lib/parser/recording-files/events-hollow/scene-event';
import { SpellDownEvent } from '~/lib/parser/recording-files/events-hollow/spell-down-event';
import { SpellFireballEvent } from '~/lib/parser/recording-files/events-hollow/spell-fireball-event';
import { SpellUpEvent } from '~/lib/parser/recording-files/events-hollow/spell-up-event';
import {
	assertNever,
	isPlayerDataEventOfField,
	mainRoomDataBySceneName,
	playerDataFields,
	roomGroupNamesBySceneName,
	type CombinedRecording,
} from '../../../parser';
import { formatTimeMs } from '../../util';
import { AreaSelectionMode } from '../room-display-store';

export interface ValueAggregation {
	damageTaken: number;
	deaths: number;

	focusing: number;
	spellFireball: number;
	spellUp: number;
	spellDown: number;

	geoEarned: number;
	geoSpent: number;

	essenceEarned: number;
	essenceSpent: number;

	timeSpendMs: number;
	firstVisitMs: number | null;
	visits: number;
	visitOrder: number | null;
}
export type AggregationVariable = keyof ValueAggregation;
export type AggregationVariableAdditive = {
	[K in AggregationVariable]: null extends ValueAggregation[K] ? never : K;
}[AggregationVariable];

export interface ValueAggregationTimePoint extends ValueAggregation {
	msIntoGame: number;
	isActiveScene: boolean;
}

const createEmptyAggregation = (): ValueAggregation => ({
	visitOrder: null,
	visits: 0,
	deaths: 0,
	focusing: 0,
	spellFireball: 0,
	spellUp: 0,
	spellDown: 0,
	damageTaken: 0,
	geoEarned: 0,
	geoSpent: 0,
	essenceEarned: 0,
	essenceSpent: 0,
	timeSpendMs: 0,
	firstVisitMs: null,
});

const EMPTY_AGGREGATION: ValueAggregation = createEmptyAggregation();

export function isAggregationVariableAdditive(variable: AggregationVariable): variable is AggregationVariableAdditive {
	return EMPTY_AGGREGATION[variable] !== null;
}
export function aggregationVariableDefaultValue(variable: AggregationVariable) {
	return EMPTY_AGGREGATION[variable];
}

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
	essenceEarned: aggregation?.essenceEarned ?? 0,
	essenceSpent: aggregation?.essenceSpent ?? 0,
	timeSpendMs: aggregation?.timeSpendMs ?? 0,
	firstVisitMs: aggregation?.firstVisitMs ?? null,
	visits: aggregation?.visits ?? 0,
	visitOrder: aggregation?.visitOrder ?? null,
	msIntoGame,
	isActiveScene,
});

export function isAggregationTimepoint(
	aggregation: ValueAggregation | ValueAggregationTimePoint,
): aggregation is ValueAggregationTimePoint {
	return 'msIntoGame' in aggregation;
}

export type AggregatedRunData = ReturnType<typeof aggregateRecording>;

const formatTimeMsVar = (ms: number | null) => {
	return ms !== null ? formatTimeMs(ms) : 'N/A';
};

const formatNumberVar = (value: number | null) => {
	return value !== null ? value : 'N/A';
};

export type MaximumMode = 'overScenes' | 'overZones';

export const aggregationVariableInfos: {
	[key in AggregationVariable]: {
		name: string;
		description: string;
		format: (value: number | null) => string | number | null;
		isTimestamp: boolean;
		showHistory: boolean;
		showHistoryDelta: boolean;
	};
} = {
	visits: {
		name: 'Visits',
		description: 'Number of times this scene/area has been entered.',
		format: formatNumberVar,
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	},
	firstVisitMs: {
		name: 'First visited at',
		description: 'Time of first visit',
		format: formatTimeMsVar,
		isTimestamp: true,
		showHistory: false,
		showHistoryDelta: false,
	},
	visitOrder: {
		name: 'Visit Order',
		description:
			'The order this scene or area was first visited (e.g., 5 means four others were first visited before it).',
		format: formatNumberVar,
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	},
	timeSpendMs: {
		name: 'Time spent',
		description: 'Total time spent in a scene/area of all visits combined.',
		format: formatTimeMsVar,
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: true,
	},
	damageTaken: {
		name: 'Damage taken',
		description: 'Total damage taken in masks',
		format: formatNumberVar,
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: true,
	},
	deaths: {
		name: 'Deaths',
		description: 'Number of times the player died in a scene/area.',
		format: formatNumberVar,
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	},
	focusing: {
		name: 'Focusing',
		description: 'Number of times the player started to focus.',
		format: formatNumberVar,
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	},
	spellFireball: {
		name: 'Vengeful Spirit',
		description: 'Number of times the player used a fireball spell.',
		format: formatNumberVar,
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	},
	spellDown: {
		name: 'Desolate Dive',
		description: 'Number of times the player used a downwards spell.',
		format: formatNumberVar,
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	},
	spellUp: {
		name: 'Howling Wraiths',
		description: 'Number of times the player used an upwards spell.',
		format: formatNumberVar,
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: false,
	},
	geoEarned: {
		name: 'Geo earned',
		description: 'Does not include geo earned by defeating the shade.',
		format: formatNumberVar,
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: true,
	},
	geoSpent: {
		name: 'Geo spent',
		description: 'Does not include Geo lost by dying and not defeating the shade.',
		format: formatNumberVar,
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: true,
	},
	essenceEarned: {
		name: 'Essence earned',
		description: 'Essence obtained by e.g. defeating dream bosses, or collecting orbs from whispering roots.',
		format: formatNumberVar,
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: true,
	},
	essenceSpent: {
		name: 'Essence spent',
		description: 'Essence spent by using the dream gate.',
		format: formatNumberVar,
		isTimestamp: false,
		showHistory: true,
		showHistoryDelta: true,
	},
};

export const aggregationVariables = Object.keys(aggregationVariableInfos) as AggregationVariable[];

export function formatAggregatedVariableValue(variable: AggregationVariable, value: number | null) {
	const varInfo = aggregationVariableInfos[variable];
	return varInfo.format(value);
}

export const virtualSceneName = {
	all: ':all:',
	zone(zoneName: string) {
		return `:zone:${zoneName}`;
	},
	groupBossSequence(bossSequenceName: string) {
		return `group_boss_seq:${bossSequenceName}`;
	},
	bossSequence(bossSequenceName: string, sceneName: string) {
		return `boss_seq:${bossSequenceName}:${sceneName}`;
	},
};

function getMaximumModeOfVirtualScene(sceneName: string): MaximumMode | null {
	if (sceneName === virtualSceneName.all) return null;
	if (sceneName.startsWith(':zone:')) return 'overZones';
	return 'overScenes';
}

export function getVirtualSceneName(sceneName: string, mode: AreaSelectionMode): string | null {
	if (mode === 'room') return sceneName;
	if (mode === 'zone') {
		if (!sceneName) return null;
		const roomData = mainRoomDataBySceneName.get(sceneName);
		const zoneName = roomData?.zoneNameFormatted;
		return zoneName ? virtualSceneName.zone(zoneName) : null;
	}
	if (mode === 'all') return virtualSceneName.all;
	assertNever(mode);
}

export function getVirtualSceneNameForHeatMap(sceneName: string, mode: AreaSelectionMode): string {
	if (mode == 'all') return sceneName;
	return getVirtualSceneName(sceneName, mode) ?? sceneName;
}

export function getZoneNameFromSceneName(sceneName: string | undefined | null): string | undefined {
	if (!sceneName) return undefined;
	const roomData = mainRoomDataBySceneName.get(sceneName);
	return roomData?.zoneNameFormatted;
}

// type AggregationStoreValue = Record<RunId, AggregatedRunData>;

export function aggregateRecording(recording: CombinedRecording) {
	const countPerScene: Record<string, ValueAggregation> = {};
	const countPerSceneOverTime: Record<string, ValueAggregationTimePoint[]> = {};

	const maxPerMode: Record<MaximumMode, ValueAggregation> = {
		overScenes: createEmptyAggregation(),
		overZones: createEmptyAggregation(),
	};

	const visitOrderPerMode: Record<MaximumMode, number> = {
		overScenes: 0,
		overZones: 0,
	};

	let countOfTimePoints = 0;

	function addToScenes(
		virtualScenes: readonly string[],
		msIntoGame: number,
		variable: AggregationVariable,
		value: number,
	) {
		virtualScenes.forEach((sceneOrGroupName) => {
			// total of scene
			let totalsOfScene: ValueAggregation = countPerScene[sceneOrGroupName];
			if (!totalsOfScene) {
				totalsOfScene = countPerScene[sceneOrGroupName] = createEmptyAggregation();
			}
			totalsOfScene[variable] = (totalsOfScene[variable] ?? 0) + value;

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
			current[variable] += value;

			// max total over all scenes
			const maximumMode = getMaximumModeOfVirtualScene(sceneOrGroupName);
			if (maximumMode) {
				maxPerMode[maximumMode][variable] = Math.max(
					maxPerMode[maximumMode][variable] ?? -Infinity,
					totalsOfScene[variable] ?? -Infinity,
				);
				maxPerMode[maximumMode].timeSpendMs = Math.max(
					maxPerMode[maximumMode].timeSpendMs,
					totalsOfScene.timeSpendMs,
				);
			}
		});
	}

	let currentSceneEvent: SceneEvent | null = null;
	let currentVirtualScenes: string[] = [];
	let currentSceneEnteredAtMs = 0;
	const currentSceneEnteredWithMsSpendPerVirtualScene: Map<string, number> = new Map();
	// let previousScene

	// const x = [] as any[];

	function calculateCurrentVirtualScenes() {
		const groups = currentSceneEvent ? (roomGroupNamesBySceneName.get(currentSceneEvent.sceneName) ?? []) : [];
		const newVirtualScenes = [
			...(currentSceneEvent ? [currentSceneEvent.sceneName] : []),
			...groups.map((it) => it),
		];

		// boss sequences
		if (currentSceneEvent?.currentBossSequence) {
			const originalLength = newVirtualScenes.length;
			for (let i = 0; i < originalLength; i++) {
				const sceneName = newVirtualScenes[i];
				newVirtualScenes.push(virtualSceneName.groupBossSequence(currentSceneEvent.currentBossSequence.name));
				newVirtualScenes.push(
					virtualSceneName.bossSequence(currentSceneEvent.currentBossSequence.name, sceneName),
				);
			}
		}
		// all
		newVirtualScenes.push(virtualSceneName.all);
		currentVirtualScenes = newVirtualScenes;
		// zone
		const zoneName = getZoneNameFromSceneName(currentSceneEvent?.sceneName);
		if (zoneName) {
			currentVirtualScenes.push(virtualSceneName.zone(zoneName));
		}
	}

	function currentVirtualScenesChanged({
		msIntoGame,
		previousVirtualScenes,
	}: {
		msIntoGame: number;
		previousVirtualScenes: string[];
	}) {
		// x.push(formatTimeMs(msIntoGame) + ' ' + currentVirtualScenes.join(','));
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
		const didIncreaseVisitOrderPerMode: Record<MaximumMode, boolean> = {
			overScenes: false,
			overZones: false,
		};
		for (const virtualScene of currentVirtualScenes) {
			const virtualSceneAsArr = [virtualScene];

			currentSceneEnteredWithMsSpendPerVirtualScene.set(
				virtualScene,
				countPerScene[virtualScene]?.timeSpendMs ?? 0,
			);

			if (!previousVirtualScenes.includes(virtualScene)) {
				// only counts visit when not already in virtual scene before
				addToScenes(virtualSceneAsArr, msIntoGame, 'visits', 1);
			}
			if ((countPerScene[virtualScene]?.firstVisitMs ?? null) === null) {
				// first visit of virtual scene
				addToScenes(virtualSceneAsArr, msIntoGame, 'firstVisitMs', msIntoGame);
			}
			if ((countPerScene[virtualScene]?.visitOrder ?? null) === null) {
				// first visit of virtual scene
				const maximumMode = getMaximumModeOfVirtualScene(virtualScene);
				if (maximumMode) {
					const visitOrder = didIncreaseVisitOrderPerMode[maximumMode]
						? visitOrderPerMode[maximumMode]
						: ++visitOrderPerMode[maximumMode];
					didIncreaseVisitOrderPerMode[maximumMode] = true;
					addToScenes(virtualSceneAsArr, msIntoGame, 'visitOrder', visitOrder);
				}
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

			// --- essence ---
			const essenceDiff = event.dreamOrbs - event.previousFrameEndEvent.dreamOrbs;
			if (essenceDiff < 0) {
				addToScenes(currentVirtualScenes, event.msIntoGame, 'essenceSpent', -essenceDiff);
			} else if (essenceDiff > 0) {
				addToScenes(currentVirtualScenes, event.msIntoGame, 'essenceEarned', essenceDiff);
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

	// console.log({ countPerScene, maxPerMode });
	// console.log(x);

	return { countPerScene, maxPerMode, countPerSceneOverTime };
}
