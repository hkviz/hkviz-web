import { computed, signal } from '@preact/signals-react';
import { playerDataFields } from '../viz/player-data/player-data';
import { type CombinedRecording } from '../viz/recording-files/recording';

const recording = signal<CombinedRecording | null>(null);
const timeframe = computed(() => {
    const r = recording.value;
    if (!r || r.events.length === 0) return { min: 0, max: 0 } as const;

    return { min: r.events[0]!.msIntoGame, max: r.lastEvent().msIntoGame };
});

const isSteelSoul = computed(() => {
    const permaDeathValue = recording.value?.lastPlayerDataEventOfField(
        playerDataFields.byFieldName.permadeathMode,
    )?.value;
    return permaDeathValue === 1 || permaDeathValue === 2;
});

export const gameplayStore = {
    recording,
    timeframe,
    isSteelSoul,
};
