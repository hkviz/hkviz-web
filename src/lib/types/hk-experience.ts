// TODO remove once surveys are removed

import * as v from 'valibot';
import { playingFrequencyCodeSchema } from './playing-frequency';
import { playingSinceCodeSchema } from './playing-since';

export const hkExperienceSchema = v.object({
    playingSince: playingSinceCodeSchema,
    playingFrequency: v.nullable(playingFrequencyCodeSchema),
    gotDreamnail: v.boolean(),
    didEndboss: v.boolean(),
    enteredWhitePalace: v.boolean(),
    got112Percent: v.boolean(),
});

export type HkExperience = v.InferInput<typeof hkExperienceSchema>;

export type HkExperienceInput = { [key in keyof HkExperience]: HkExperience[key] | null };

export const hkExperienceEmpty: HkExperienceInput = {
    playingSince: null,
    playingFrequency: null,
    gotDreamnail: null,
    didEndboss: null,
    enteredWhitePalace: null,
    got112Percent: null,
};

export function hkExperienceFinished(input: HkExperienceInput): boolean {
    if (input.playingSince === 'never') {
        return true;
    }
    if (!input.playingFrequency) {
        return false;
    }

    return (
        input.gotDreamnail === false ||
        ((input.didEndboss === false || input.enteredWhitePalace === false) &&
            input.didEndboss != null &&
            input.enteredWhitePalace != null) ||
        input.got112Percent != null
    );
}

export function hkExperienceCleaned(input: HkExperienceInput): HkExperience {
    const playedBefore = input.playingFrequency !== 'not_in_the_last_year';
    const gotDreamnail = (playedBefore && input.gotDreamnail) ?? false;

    const didEndboss = (gotDreamnail && input.didEndboss) ?? false;
    const enteredWhitePalace = (gotDreamnail && input.enteredWhitePalace) ?? false;

    const got112Percent = (didEndboss && enteredWhitePalace && input.got112Percent) ?? false;

    return {
        playingSince: input.playingSince!,
        playingFrequency: input.playingFrequency!,
        gotDreamnail,
        didEndboss,
        enteredWhitePalace,
        got112Percent,
    };
}
