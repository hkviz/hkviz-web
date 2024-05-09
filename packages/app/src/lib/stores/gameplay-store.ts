import { playerDataFields } from '@hkviz/parser';
import { gameplayStore as solidGameplayStore } from '@hkviz/viz';
import { computed } from '@preact/signals-react';

const timeframe = computed(() => {
    const r = solidGameplayStore.recording.valuePreact;
    if (!r || r.events.length === 0) return { min: 0, max: 0 } as const;

    return { min: r.events[0]!.msIntoGame, max: r.lastEvent().msIntoGame };
});

const isSteelSoul = computed(() => {
    const permaDeathValue = solidGameplayStore.recording.valuePreact?.lastPlayerDataEventOfField(
        playerDataFields.byFieldName.permadeathMode,
    )?.value;
    return permaDeathValue === 1 || permaDeathValue === 2;
});

export const gameplayStore = {
    ...solidGameplayStore,
    timeFrame: timeframe,
    isSteelSoul,
};
