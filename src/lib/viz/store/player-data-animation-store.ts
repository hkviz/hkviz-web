import { createContext, createMemo, useContext, type Accessor } from 'solid-js';
import {
	binarySearchLastIndexBefore,
	getDefaultValue,
	playerDataFields,
	type PlayerDataEvent,
	type PlayerDataFieldValue,
} from '../../parser';
import { AnimationStore } from './animation-store';
import { GameplayStore } from './gameplay-store';

export function createPlayerDataAnimationStore(animationStore: AnimationStore, gameplayStore: GameplayStore) {
	const currentEvents = Object.fromEntries(
		Object.entries(playerDataFields.byFieldName).map(([fieldName, field]) => {
			return [
				fieldName,
				// eslint-disable-next-line solid/reactivity
				createMemo(() => {
					const r = gameplayStore.recording();
					if (!r) return null;

					const events = r.playerDataEventsPerField.get(field);
					if (!events || events.length === 0) return null;

					const index = binarySearchLastIndexBefore(events, animationStore.msIntoGame(), (e) => e.msIntoGame);
					if (index === -1) return null;
					return events[index] ?? null;
				}),
			];
		}),
	) as any as {
		[fieldName in keyof typeof playerDataFields.byFieldName]: Accessor<
			PlayerDataEvent<(typeof playerDataFields)['byFieldName'][fieldName]>
		>;
	};

	const currentValues = Object.fromEntries(
		Object.entries(currentEvents).map(([fieldName, event]) => {
			return [
				fieldName,
				// eslint-disable-next-line solid/reactivity
				createMemo(() => {
					const e: PlayerDataEvent<any> = (event as any)();

					if (!e) return getDefaultValue((playerDataFields.byFieldName as any)[fieldName as any]);
					return e.value;
				}),
			];
		}),
	) as any as {
		[fieldName in keyof typeof playerDataFields.byFieldName]: Accessor<
			PlayerDataFieldValue<(typeof playerDataFields)['byFieldName'][fieldName]>
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
