import {
	binarySearchLastIndexBefore,
	getDefaultValue,
	playerDataFields,
	type PlayerDataEvent,
	type PlayerDataFieldValue,
} from '../../parser';
import { createMemo, type Accessor } from 'solid-js';
import { animationStore } from './animation-store';
import { gameplayStore } from './gameplay-store';

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

export const playerDataAnimationStore = {
	currentEvents,
	currentValues,
};
