import { computed, type ReadonlySignal } from '@preact/signals-react';
import { binarySearchLastIndexBefore } from '../utils/binary-search';
import { getDefaultValue, playerDataFields, type PlayerDataFieldValue } from '../viz/player-data/player-data';
import { type PlayerDataEvent } from '../viz/recording-files/events/player-data-event';
import { msIntoGame, recording } from './gameplay-state';

export const currentPlayerDataEvents = Object.fromEntries(
    Object.entries(playerDataFields.byFieldName).map(([fieldName, field]) => {
        return [
            fieldName,
            computed(() => {
                const r = recording.value;
                if (!r) return null;

                const events = r.playerDataEventsPerField.get(field);
                if (!events || events.length === 0) return null;

                const index = binarySearchLastIndexBefore(events, msIntoGame.value, (e) => e.msIntoGame);
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

export const currentPlayerDataValue = Object.fromEntries(
    Object.entries(currentPlayerDataEvents).map(([fieldName, event]) => {
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
