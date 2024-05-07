import { z } from 'zod';
import { ageRangeSchema } from './age-range';
import { countrySchema } from './country';

export const studyDemographicSchema = z
    .object({
        ageRange: ageRangeSchema,
        gender: z.null(),
        genderWoman: z.boolean(),
        genderMan: z.boolean(),
        genderNonBinary: z.boolean(),
        genderPreferNotToDisclose: z.boolean(),
        genderPreferToSelfDescribe: z.boolean(),
        genderCustom: z.string().max(124, 'Please try to keep your answer under 124 characters'),
        country: countrySchema,
    })
    .refine(
        (data) => {
            return (
                data.genderWoman ||
                data.genderMan ||
                data.genderNonBinary ||
                data.genderPreferNotToDisclose ||
                data.genderPreferToSelfDescribe
            );
        },
        {
            message: 'Please tick at least one checkbox',
            path: ['gender'],
        },
    );

export const studyDemographicDefaultData: Partial<z.infer<typeof studyDemographicSchema>> = {
    genderCustom: '',
    gender: null,
    genderWoman: false,
    genderMan: false,
    genderNonBinary: false,
    genderPreferNotToDisclose: false,
    genderPreferToSelfDescribe: false,
};
