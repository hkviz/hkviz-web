import { z } from 'zod';
import { ageRangeSchema } from './age-range';
import { countrySchema } from './country';
import { genderSchema } from './gender';

export const studyDemographicSchema = z.object({
    ageRange: ageRangeSchema,
    gender: genderSchema,
    genderCustom: z.string().max(124, 'Please try to keep your answer under 124 characters'),
    country: countrySchema,
});

export const studyDemographicDefaultData: Partial<z.infer<typeof studyDemographicSchema>> = {
    genderCustom: '',
};
