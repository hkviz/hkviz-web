// Genders from https://www.reimaginegender.org/insights/gender-and-forms

import { z } from 'zod';
import { type CodesOf } from './_utils';

export const playingFrequencyOptions = [
    {
        code: '2_to_3_times_per_week',
        name: '2 to 3 times per week',
    },
    {
        code: 'once_per_week',
        name: 'Once per week',
    },
    {
        code: '2_to_3_times_per_month',
        name: '2 to 3 times per month',
    },
    {
        code: 'once_per_month',
        name: 'Once per month',
    },
    {
        code: 'less_than_once_per_month',
        name: 'Less than once per month',
    },
    {
        code: 'at_least_once_per_year',
        name: 'At least once per year',
    },
    {
        code: 'not_in_the_last_year',
        name: 'I have not played in the last year',
    },
] as const;

type PlayingFrequencyCodes = CodesOf<typeof playingFrequencyOptions>;
export type PlayingFrequencyCode = PlayingFrequencyCodes[number];
export const playingFrequencyCodes = playingFrequencyOptions.map((it) => it.code) as unknown as PlayingFrequencyCodes;

export const playingFrequencyCodeSchema = z.enum(playingFrequencyCodes);
