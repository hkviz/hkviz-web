import { playerDataFields } from '@hkviz/parser';
import { gameplayStore as gameplayStoreSolid } from '@hkviz/viz';
import { computed } from '@preact/signals-react';

const timeframe = computed(() => {
    const r = gameplayStoreSolid.recording.valuePreact;
    if (!r || r.events.length === 0) return { min: 0, max: 0 } as const;

    return { min: r.events[0]!.msIntoGame, max: r.lastEvent().msIntoGame };
});

const isSteelSoul = computed(() => {
    const permaDeathValue = gameplayStoreSolid.recording.valuePreact?.lastPlayerDataEventOfField(
        playerDataFields.byFieldName.permadeathMode,
    )?.value;
    return permaDeathValue === 1 || permaDeathValue === 2;
});

export const gameplayStore = {
    ...gameplayStoreSolid,
    timeFrame: timeframe,
    isSteelSoul,
};
