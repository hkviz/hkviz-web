import { z } from 'zod';

export const visibilities = [
    {
        code: 'public',
        name: 'Public',
    },
    {
        code: 'unlisted',
        name: 'Unlisted',
    },
    {
        code: 'private',
        name: 'Private',
    },
] as const;

type CodesOf<T extends readonly { code: unknown }[]> = {
    [I in keyof T]: T[I]['code'];
};

type VisibilityCodes = CodesOf<typeof visibilities>;
export type VisibilityCode = VisibilityCodes[number];
export const visibilityCodes = visibilities.map((it) => it.code) as unknown as VisibilityCodes;

export const visibilitySchema = z.enum(visibilityCodes);
