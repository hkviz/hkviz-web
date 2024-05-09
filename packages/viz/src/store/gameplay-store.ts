import { playerDataFields, type CombinedRecording } from '@hkviz/parser';
import { createMemo } from 'solid-js';
import { createSignal } from '../preact-solid-combat';

const [recording, setRecording] = createSignal<CombinedRecording | null>(null);

function reset() {
    setRecording(null);
}

const timeFrame = createMemo(() => {
    const r = recording();
    if (!r || r.events.length === 0) return { min: 0, max: 0 } as const;

    return { min: r.events[0]!.msIntoGame, max: r.lastEvent().msIntoGame };
});

const isSteelSoul = createMemo(() => {
    const permaDeathValue = recording()?.lastPlayerDataEventOfField(playerDataFields.byFieldName.permadeathMode)?.value;
    return permaDeathValue === 1 || permaDeathValue === 2;
});

export const gameplayStore = {
    recording,
    setRecording,
    timeFrame,
    isSteelSoul,
    reset,
};
