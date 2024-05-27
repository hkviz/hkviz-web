// Genders from https://www.reimaginegender.org/insights/gender-and-forms

import * as v from 'valibot';

export const ageRanges = [
    {
        code: 'u18',
        name: 'under 18',
        // TODO actually remove, or handle differently, as db enum change would require some work
        removed: true,
    },
    {
        code: '18_24',
        name: '18-24',
    },
    {
        code: '25_34',
        name: '25-34',
    },
    {
        code: '35_44',
        name: '35-44',
    },
    {
        code: '45_54',
        name: '45-54',
    },
    {
        code: '55_64',
        name: '55-64',
    },
    {
        code: '65p',
        name: '65+',
    },
    {
        code: 'prefer_no',
        name: 'Prefer not to state',
    },
] as const;

type CodesOf<T extends readonly { code: unknown }[]> = {
    [I in keyof T]: T[I]['code'];
};

type AgeRanges = CodesOf<typeof ageRanges>;
export type AgeRange = AgeRanges[number];
export const ageRangeCodes = ageRanges.map((it) => it.code) as unknown as AgeRanges;

export const ageRangeSchema = v.picklist(ageRangeCodes);
