import {
    binarySearchLastIndexBefore,
    getDefaultValue,
    playerDataFields,
    type PlayerDataEvent,
    type PlayerDataFieldValue,
} from '@hkviz/parser';
import { computed, type ReadonlySignal } from '@preact/signals-react';
import { animationStore } from './animation-store';
import { gameplayStore } from './gameplay-store';

const currentEvents = Object.fromEntries(
    Object.entries(playerDataFields.byFieldName).map(([fieldName, field]) => {
        return [
            fieldName,
            computed(() => {
                const r = gameplayStore.recording.valuePreact;
                if (!r) return null;

                const events = r.playerDataEventsPerField.get(field);
                if (!events || events.length === 0) return null;

                const index = binarySearchLastIndexBefore(
                    events,
                    animationStore.msIntoGame.valuePreact,
                    (e) => e.msIntoGame,
                );
                if (index === -1) return null;
                return events[index] ?? null;
            }),
        ];
    }),
) as any as {
    [fieldName in keyof typeof playerDataFields.byFieldName]: ReadonlySignal<
        PlayerDataEvent<(typeof playerDataFields)['byFieldName'][fieldName]>
    >;
};

const currentValues = Object.fromEntries(
    Object.entries(currentEvents).map(([fieldName, event]) => {
        return [
            fieldName,
            computed(() => {
                const e = event.value;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                if (!e) return getDefaultValue((playerDataFields.byFieldName as any)[fieldName as any]);
                return e.value;
            }),
        ];
    }),
) as any as {
    [fieldName in keyof typeof playerDataFields.byFieldName]: ReadonlySignal<
        PlayerDataFieldValue<(typeof playerDataFields)['byFieldName'][fieldName]>
    >;
};

export const playerDataAnimationStore = {
    currentEvents,
    currentValues,
};
