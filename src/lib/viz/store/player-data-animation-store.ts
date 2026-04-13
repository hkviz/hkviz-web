import { createLazyMemo } from '@solid-primitives/memo';
import { createContext, createMemo, useContext, type Accessor } from 'solid-js';
import {
	PlayerDataFieldNameSilk,
	PlayerDataFieldValueSilk,
} from '~/lib/game-data/silk-data/player-data-silk.generated';
import { PlayerDataEventHollow } from '~/lib/parser/recording-files/events-hollow/player-data-event';
import { PlayerDataEventSilk } from '~/lib/parser/recording-files/events-silk/player-data-event-silk';
import { CombinedRecordingHollow } from '~/lib/parser/recording-files/parser-hollow/recording-hollow';
import { CombinedRecordingSilk } from '~/lib/parser/recording-files/parser-silk/recording-silk';
import {
	binarySearchLastIndexBefore,
	getDefaultValue,
	playerDataFieldsHollow,
	PlayerDataFieldValueHollow,
} from '../../parser';
import { AnimationStore } from './animation-store';
import { GameplayStore } from './gameplay-store';

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

							const events = r.playerDataEventsPerField.get(field);
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
				[fieldName in keyof typeof playerDataFieldsHollow.byFieldName]: Accessor<
					PlayerDataEventHollow<(typeof playerDataFieldsHollow)['byFieldName'][fieldName]>
				>;
			};

			const values = Object.fromEntries(
				Object.entries(events).map(([fieldName, event]) => {
					return [
						fieldName,
						createLazyMemo(() => {
							const e: PlayerDataEventHollow<any> = (event as any)();

							if (!e)
								return getDefaultValue((playerDataFieldsHollow.byFieldName as any)[fieldName as any]);
							return e.value;
						}),
					];
				}),
			) as any as {
				[fieldName in keyof typeof playerDataFieldsHollow.byFieldName]: Accessor<
					PlayerDataFieldValueHollow<(typeof playerDataFieldsHollow)['byFieldName'][fieldName]>
				>;
			};

			return {
				game: 'hollow',
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
				[fieldName in keyof typeof playerDataFieldsHollow.byFieldName]: Accessor<
					PlayerDataEventHollow<(typeof playerDataFieldsHollow)['byFieldName'][fieldName]>
				>;
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

			return {
				game: 'silk',
				events,
				values,
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
