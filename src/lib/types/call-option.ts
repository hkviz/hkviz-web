// Genders from https://www.reimaginegender.org/insights/gender-and-forms

import * as v from 'valibot';
import { type CodesOf } from './_utils';

export const callOptions = [
    {
        code: 'zoom',
        name: 'Zoom',
    },
    {
        code: 'discord',
        name: 'Discord',
    },
] as const;

type CallOptionCodes = CodesOf<typeof callOptions>;
export type CallOptionCode = CallOptionCodes[number];
export const callOptionCodes = callOptions.map((it) => it.code) as unknown as CallOptionCodes;

export const callOptionCodeSchema = v.picklist(callOptionCodes);
