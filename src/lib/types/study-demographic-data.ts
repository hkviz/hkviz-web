import { z } from 'zod';
import { ageRangeSchema } from './ageRange';
import { countrySchema } from './country';
import { genderSchema } from './gender';
import { hkExperienceSchema } from './hk-experience';

export const studyDemographicSchema = z.object({
    previousHollowKnightExperience: hkExperienceSchema,
    ageRange: ageRangeSchema,
    gender: genderSchema,
    genderCustom: z.string(),
    country: z.union([z.enum(['prefer-no']), countrySchema]),
});

export const studyDemographicDefaultData: Partial<z.infer<typeof studyDemographicSchema>> = {
    genderCustom: '',
};
