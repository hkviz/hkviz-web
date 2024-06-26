// Genders from https://www.reimaginegender.org/insights/gender-and-forms

import * as v from 'valibot';

export const genders = [
    {
        code: 'woman',
        name: 'Woman',
    },
    {
        code: 'man',
        name: 'Man',
    },
    {
        code: 'trans_woman',
        name: 'Transgender Woman',
    },
    {
        code: 'trans_man',
        name: 'Transgender Man',
    },
    {
        code: 'non_binary',
        name: 'Non-Binary',
    },
    {
        code: 'agender',
        name: "Agender / I don't identify with any gender",
    },
    {
        code: 'not_listed',
        name: 'Gender not listed',
    },
    {
        code: 'prefer_no',
        name: 'Prefer not to state',
    },
] as const;

type CodesOf<T extends readonly { code: unknown }[]> = {
    [I in keyof T]: T[I]['code'];
};

type GenderCodes = CodesOf<typeof genders>;
export type GenderCode = GenderCodes[number];
export const oldGenderCodes = genders.map((it) => it.code) as unknown as GenderCodes;

export const oldGenderSchema = v.picklist(oldGenderCodes);
