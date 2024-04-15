import { signal } from '@preact/signals-react';
import { type AggregatedRunData } from '../viz/recording-files/run-aggregation-store';

const data = signal<AggregatedRunData | null>(null);

export const aggregationStore = { data };
