import { createLazyMemo } from '@solid-primitives/memo';
import { createContext, createMemo, useContext, type Accessor } from 'solid-js';
import type {
	PlayerDataFieldNameHollow,
	PlayerDataFieldValueHollow,
} from '~/lib/game-data/hollow-data/player-data-hollow';
import type { PlayerDataTestDataSilk, PlayerDataTestGroupSilk } from '~/lib/game-data/silk-data/map-data-silk.types';
import type {
	PlayerDataFieldNameSilk,
	PlayerDataFieldValueSilk,
} from '~/lib/game-data/silk-data/player-data/player-data-silk.generated';
import type { PlayerDataEventHollow } from '~/lib/parser/recording-files/events-hollow/player-data-event-hollow';
import type { PlayerDataEventSilk } from '~/lib/parser/recording-files/events-silk/player-data-event-silk';
import type { CombinedRecordingHollow } from '~/lib/parser/recording-files/parser-hollow/recording-hollow';
import { isCombinedRecordingSilk } from '~/lib/parser/recording-files/parser-silk/recording-check-silk';
import type { CombinedRecordingSilk } from '~/lib/parser/recording-files/parser-silk/recording-silk';
import { binarySearchLastIndexBefore } from '~/lib/util/binary-search';
import { assertNever } from '~/lib/util/other';
import type { AnimationStore } from './animation-store';
import type { GameplayStore } from './gameplay-store';

export function createPlayerDataAnimationStore(animationStore: AnimationStore, gameplayStore: GameplayStore) {
	const currentPlayerData = createMemo(() => {
		const gameModule = gameplayStore.gameModule();
		if (!gameModule) return {};

		if (gameModule.game === 'hollow') {
			const events = Object.fromEntries(
				gameModule.playerDataFields.list.map((field) => {
					return [
						field.name,
						createLazyMemo(() => {
							const r = gameplayStore.recording() as CombinedRecordingHollow | null;
							if (!r) return null;

							const events = r.playerDataEventsPerField.get(field.name);
							if (!events || events.length === 0) return null;

							const index = binarySearchLastIndexBefore(
								events,
								animationStore.msIntoGame(),
								(e) => e.msIntoGame,
							);
							if (index === -1) return null;
							return events[index] ?? null;
						}),
					];
				}),
			) as any as {
				[fieldName in PlayerDataFieldNameHollow]: Accessor<PlayerDataEventHollow<PlayerDataFieldNameHollow>>;
			};

			const values = Object.fromEntries(
				Object.entries(events).map(([fieldName, event]) => {
					return [
						fieldName,
						createLazyMemo(() => {
							const e: PlayerDataEventHollow<any> = (event as any)();

							if (!e)
								return gameModule.playerDataFields.getDefaultValue(
									fieldName as PlayerDataFieldNameHollow,
								);
							return e.value;
						}),
					];
				}),
			) as any as {
				[fieldName in PlayerDataFieldNameHollow]: Accessor<PlayerDataFieldValueHollow<fieldName>>;
			};

			return {
				game: 'hollow' as const,
				events,
				values,
			};
		} else if (gameModule.game === 'silk') {
			const events = Object.fromEntries(
				gameModule.playerDataFields.list.map((field) => {
					return [
						field.name,
						createLazyMemo(() => {
							const r = gameplayStore.recording() as CombinedRecordingSilk | null;
							if (!r) return null;

							const events = r.getPlayerDataEventsOfField(field.name);
							if (!events || events.length === 0) return null;

							const index = binarySearchLastIndexBefore(
								events,
								animationStore.msIntoGame(),
								(e) => e.msIntoGame,
							);
							if (index === -1) return null;
							return events[index] ?? null;
						}),
					];
				}),
			) as any as {
				[fieldName in PlayerDataFieldNameHollow]: Accessor<PlayerDataEventHollow<PlayerDataFieldNameHollow>>;
			};

			const values = Object.fromEntries(
				Object.entries(events).map(([fieldName, event]) => {
					return [
						fieldName,
						createLazyMemo(() => {
							const e: PlayerDataEventSilk<any> = (event as any)();
							if (!e) return null;
							return e.value;
						}),
					];
				}),
			) as any as {
				[fieldName in PlayerDataFieldNameSilk]: Accessor<PlayerDataFieldValueSilk<fieldName> | null>;
			};

			function isConditionFulfilled(condition: PlayerDataTestDataSilk, mode: 'animated' | 'end') {
				const gameplayUnchecked = gameplayStore.recording();
				if (!gameplayUnchecked) {
					return false;
				}
				if (!isCombinedRecordingSilk(gameplayUnchecked)) {
					console.warn(
						'Trying to check player data condition while not having a silk recording',
						condition,
						mode,
					);
					return false;
				}
				const gameplay = gameplayUnchecked;
				function getValue(fieldName: PlayerDataFieldNameSilk): any {
					return mode === 'animated'
						? (values[fieldName as PlayerDataFieldNameSilk]?.() ?? null)
						: (gameplay.lastPlayerDataEventOfField(fieldName)?.value ?? null);
				}

				function isGroupFulfilled(group: PlayerDataTestGroupSilk) {
					return group.tests.every((test) => {
						const value = getValue(test.fieldName);
						// Bool
						if (test.type === 'Bool') {
							return value === test.boolValue;
						}

						// String
						if (test.type === 'String') {
							if (typeof value !== 'string') {
								console.warn(
									'Trying to compare non-string value in player data condition',
									condition,
									mode,
									test,
									value,
								);
								return false;
							}
							if (test.stringType == null || test.stringValue == null) {
								console.warn(
									'String test missing stringType or stringValue',
									condition,
									mode,
									test,
									value,
								);
								return false;
							}
							if (test.stringType === 'Equal') {
								return value === test.stringValue;
							} else if (test.stringType === 'NotEqual') {
								return value !== test.stringValue;
							} else if (test.stringType === 'Contains') {
								return value.includes(test.stringValue!);
							} else if (test.stringType === 'NotContains') {
								return !value.includes(test.stringValue!);
							} else {
								return assertNever(test.stringType);
							}
						}

						// Number + Enum
						let num1: number | null = null;
						let num2: number | null = null;
						if (test.type === 'Int') {
							num1 = value;
							num2 = test.intValue!;
						} else if (test.type === 'Float') {
							num1 = value;
							num2 = test.floatValue!;
						} else if (test.type === 'Enum') {
							num1 = value;
							num2 = test.intValue!;
						}

						if (num1 == null || num2 == null || test.numType == null) {
							console.warn(
								'Trying to compare non-number values in player data condition',
								condition,
								mode,
								test,
								value,
								test.numType,
							);
							return false;
						}

						if (test.numType === 'Equal') {
							return num1 === num2;
						} else if (test.numType === 'NotEqual') {
							return num1 !== num2;
						} else if (test.numType === 'LessThan') {
							return num1 < num2;
						} else if (test.numType === 'MoreThan') {
							return num1 > num2;
						} else {
							return assertNever(test.numType);
						}
					});
				}
				return condition.testGroups.some(isGroupFulfilled);
			}

			return {
				game: 'silk' as const,
				events,
				values,
				isConditionFulfilled,
			};
		} else {
			return null;
		}
	});

	return currentPlayerData;
}

export type PlayerDataAnimationStore = ReturnType<typeof createPlayerDataAnimationStore>;
export const PlayerDataAnimationStoreContext = createContext<PlayerDataAnimationStore>();
export function usePlayerDataAnimationStore() {
	const store = useContext(PlayerDataAnimationStoreContext);
	if (!store) throw new Error('No PlayerDataAnimationStore in context');
	return store;
}
