import { createLazyMemo } from '@solid-primitives/memo';
import { createContext, useContext, type Accessor } from 'solid-js';
import { PlayerDataEventHollow } from '~/lib/parser/recording-files/events-hollow/player-data-event';
import { CombinedRecordingSilk } from '~/lib/parser/recording-files/parser-silk/recording-silk';
import {
	binarySearchLastIndexBefore,
	getDefaultValue,
	playerDataFieldsHollow,
	PlayerDataFieldValue,
} from '../../parser';
import { AnimationStore } from './animation-store';
import { GameplayStore } from './gameplay-store';

export function createPlayerDataAnimationStore(animationStore: AnimationStore, gameplayStore: GameplayStore) {
	const currentEvents = Object.fromEntries(
		Object.entries(playerDataFieldsHollow.byFieldName).map(([fieldName, field]) => {
			return [
				fieldName,
				createLazyMemo(() => {
					const r = gameplayStore.recording();
					if (!r || r instanceof CombinedRecordingSilk) return null;

					const events = r.playerDataEventsPerField.get(field);
					if (!events || events.length === 0) return null;

					const index = binarySearchLastIndexBefore(events, animationStore.msIntoGame(), (e) => e.msIntoGame);
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

	const currentValues = Object.fromEntries(
		Object.entries(currentEvents).map(([fieldName, event]) => {
			return [
				fieldName,
				createLazyMemo(() => {
					const e: PlayerDataEventHollow<any> = (event as any)();

					if (!e) return getDefaultValue((playerDataFieldsHollow.byFieldName as any)[fieldName as any]);
					return e.value;
				}),
			];
		}),
	) as any as {
		[fieldName in keyof typeof playerDataFieldsHollow.byFieldName]: Accessor<
			PlayerDataFieldValue<(typeof playerDataFieldsHollow)['byFieldName'][fieldName]>
		>;
	};

	return {
		currentEvents,
		currentValues,
	};
}

export type PlayerDataAnimationStore = ReturnType<typeof createPlayerDataAnimationStore>;
export const PlayerDataAnimationStoreContext = createContext<PlayerDataAnimationStore>();
export function usePlayerDataAnimationStore() {
	const store = useContext(PlayerDataAnimationStoreContext);
	if (!store) throw new Error('No PlayerDataAnimationStore in context');
	return store;
}
