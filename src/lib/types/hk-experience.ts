import { z } from 'zod';

export const hkExperienceSchema = z.object({
    playedBefore: z.boolean(),
    gotDreamnail: z.boolean(),
    didEndboss: z.boolean(),
    enteredWhitePalace: z.boolean(),
    got112Percent: z.boolean(),
});

export type HkExperience = z.infer<typeof hkExperienceSchema>;

export type HkExerienceInput = { [key in keyof HkExperience]: HkExperience[key] | undefined };

export const hkExperienceEmpty: HkExerienceInput = {
    playedBefore: undefined,
    gotDreamnail: undefined,
    didEndboss: undefined,
    enteredWhitePalace: undefined,
    got112Percent: undefined,
};

export function hkExperienceFinished(input: HkExerienceInput): boolean {
    return (
        input.playedBefore === false ||
        input.gotDreamnail === false ||
        ((input.didEndboss === false || input.enteredWhitePalace === false) &&
            input.didEndboss !== undefined &&
            input.enteredWhitePalace !== undefined) ||
        input.got112Percent !== undefined
    );
}

export function hkExperienceCleaned(input: HkExerienceInput): HkExperience {
    const playedBefore = input.playedBefore ?? false;
    const gotDreamnail = (playedBefore && input.gotDreamnail) ?? false;

    const didEndboss = (gotDreamnail && input.didEndboss) ?? false;
    const enteredWhitePalace = (gotDreamnail && input.enteredWhitePalace) ?? false;

    const got112Percent = (didEndboss && enteredWhitePalace && input.got112Percent) ?? false;

    return {
        playedBefore,
        gotDreamnail,
        didEndboss,
        enteredWhitePalace,
        got112Percent,
    };
}
