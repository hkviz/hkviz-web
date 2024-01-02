import { z } from 'zod';
import { countrySchema } from './country';
import { genderSchema } from './gender';
import { hkExperienceSchema } from './hk-experience';

export const studyDemographicSchema = z.object({
    previousHollowKnightExperience: hkExperienceSchema,
    ageRange: z.enum(['prefer-no', 'under 18', '18-24', '25-34', '35-44', '55+']),
    gender: genderSchema,
    genderCustom: z.string(),
    country: z.union([z.enum(['prefer-no']), countrySchema]),
});

export const studyDemographicDefaultData: Partial<z.infer<typeof studyDemographicSchema>> = {
    genderCustom: '',
};
