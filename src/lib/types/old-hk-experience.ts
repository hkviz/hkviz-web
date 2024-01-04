import { z } from 'zod';

export const hkExperiences = [
    {
        code: 'never-played',
        name: 'I have never played HollowKnight before',
    },
    {
        code: 'played-some',
        name: 'I played before, but did not see the credits before (i.e. I did not finish the game)',
    },
    {
        code: 'played-a-lot',
        name: 'I played before, and saw the credits before (i.e. I finished the game), but I do not have 112% completion',
    },
    {
        code: 'played-a-lot-112',
        name: 'I played before, and saw the credits before (i.e. I finished the game), and I have 112% completion',
    },
] as const;

type CodesOf<T extends readonly { code: unknown }[]> = {
    [I in keyof T]: T[I]['code'];
};

type HKExperienceCodes = CodesOf<typeof hkExperiences>;
export type HKExperienceCode = HKExperienceCodes[number];
export const hkExperienceCodes = hkExperiences.map((it) => it.code) as unknown as HKExperienceCodes;

export const hkExperienceSchema = z.enum(hkExperienceCodes);
