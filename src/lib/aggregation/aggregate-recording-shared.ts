import { SceneEvent } from '~/lib/parser/recording-files/events-shared/scene-event';
import { roomGroupNamesBySceneName } from '../parser';
import { CombinedRecordingAny } from '../parser/recording-files/parser-specific/combined-recording';
import { AggregationMaximumMode } from './aggregation-max-mode';
import {
	AggregationTimePointBase,
	AggregationValueBase,
	AggregationVariableShared,
	ExtractAggregationVariable,
} from './aggregation-value-base';

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

function getMaximumModeOfVirtualScene(sceneName: string): AggregationMaximumMode | null {
	if (sceneName === virtualSceneName.all) return null;
	if (sceneName.startsWith(':zone:')) return 'overZones';
	return 'overScenes';
}

export type AddToScenesFunction<AggregationVariable> = (
	virtualScenes: readonly string[],
	msIntoGame: number,
	variable: AggregationVariable,
	value: number,
) => void;

export function aggregateRecording<
	TRecording extends CombinedRecordingAny,
	TValueAggregation extends AggregationValueBase,
	TValueAggregationTimePoint extends TValueAggregation & AggregationTimePointBase,
>(
	recording: TRecording,
	createEmptyAggregation: () => TValueAggregation,
	createAggregationTimePointClone: (
		aggregation: TValueAggregationTimePoint | undefined,
		msIntoGame: number,
		isActiveScene: boolean,
	) => TValueAggregationTimePoint,
	getZoneNameFromSceneName: (sceneName: string | undefined | null) => string | undefined,
	aggregator: (
		event: TRecording['events'][number],
		currentVirtualScenes: string[],
		addToScenes: AddToScenesFunction<ExtractAggregationVariable<TValueAggregation>>,
	) => void,
) {
	type TAggregationVariable = ExtractAggregationVariable<TValueAggregation> | AggregationVariableShared;

	const countPerScene: Record<string, TValueAggregation> = {};
	const countPerSceneOverTime: Record<string, TValueAggregationTimePoint[]> = {};

	const maxPerMode: Record<AggregationMaximumMode, TValueAggregation> = {
		overScenes: createEmptyAggregation(),
		overZones: createEmptyAggregation(),
	};

	const visitOrderPerMode: Record<AggregationMaximumMode, number> = {
		overScenes: 0,
		overZones: 0,
	};

	let countOfTimePoints = 0;

	function set(
		aggregation: TValueAggregation | TValueAggregationTimePoint,
		variable: TAggregationVariable,
		value: number,
	) {
		(aggregation as any)[variable] = value;
	}

	function add(
		aggregation: TValueAggregation | TValueAggregationTimePoint,
		variable: TAggregationVariable,
		value: number,
	) {
		set(aggregation, variable, ((aggregation as any)[variable] ?? 0) + value);
	}

	function addToScenes(
		virtualScenes: readonly string[],
		msIntoGame: number,
		variable: TAggregationVariable,
		value: number,
	) {
		virtualScenes.forEach((sceneOrGroupName) => {
			// total of scene
			let totalsOfScene: TValueAggregation = countPerScene[sceneOrGroupName];
			if (!totalsOfScene) {
				totalsOfScene = countPerScene[sceneOrGroupName] = createEmptyAggregation();
			}
			add(totalsOfScene, variable, value);

			// over time of scene
			const allOverTime =
				sceneOrGroupName in countPerSceneOverTime
					? countPerSceneOverTime[sceneOrGroupName]
					: (countPerSceneOverTime[sceneOrGroupName] = []);

			const last = allOverTime.at(-1);
			let current: TValueAggregationTimePoint;
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
			add(current, variable, value);

			// max total over all scenes
			const maximumMode = getMaximumModeOfVirtualScene(sceneOrGroupName);
			if (maximumMode) {
				set(
					maxPerMode[maximumMode],
					variable,
					Math.max(
						(maxPerMode as any)[maximumMode][variable] ?? -Infinity,
						(totalsOfScene as any)[variable] ?? -Infinity,
					),
				);
				set(
					maxPerMode[maximumMode],
					'timeSpendMs',
					Math.max(maxPerMode[maximumMode].timeSpendMs, totalsOfScene.timeSpendMs),
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
		const didIncreaseVisitOrderPerMode: Record<AggregationMaximumMode, boolean> = {
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
			if ((countPerScene[virtualScene]?.firstVisitMs ?? null) == null) {
				// first visit of virtual scene
				addToScenes(virtualSceneAsArr, msIntoGame, 'firstVisitMs', msIntoGame);
			}
			if ((countPerScene[virtualScene]?.visitOrder ?? null) == null) {
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
		} else {
			aggregator(event, currentVirtualScenes, addToScenes);
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

	return { countPerScene, maxPerMode, countPerSceneOverTime, DEFAULT: createEmptyAggregation() };
}
