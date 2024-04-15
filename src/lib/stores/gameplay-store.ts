import { signal } from '@preact/signals-react';
import { type CombinedRecording } from '../viz/recording-files/recording';

export const recording = signal<CombinedRecording | null>(null);

export const gameplayStore = {
    recording,
};
