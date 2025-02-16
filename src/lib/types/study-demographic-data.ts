import * as v from 'valibot';
import { ageRangeSchema } from './age-range';
import { countrySchema } from './country';

export const studyDemographicSchema = v.pipe(
	v.object({
		ageRange: ageRangeSchema,
		genderWoman: v.boolean(),
		genderMan: v.boolean(),
		genderNonBinary: v.boolean(),
		genderPreferNotToDisclose: v.boolean(),
		genderPreferToSelfDescribe: v.boolean(),
		genderCustom: v.pipe(v.string(), v.maxLength(124, 'Please try to keep your answer under 124 characters')),
		country: countrySchema,
	}),
	v.check(
		(data) => {
			return (
				data.genderWoman ||
				data.genderMan ||
				data.genderNonBinary ||
				data.genderPreferNotToDisclose ||
				data.genderPreferToSelfDescribe
			);
		},
		'Please tick at least one gender checkbox',
		// TODO path: ['gender'], since will be removed soon no need to actually fix.
	),
);

export type StudyDemographicData = v.InferInput<typeof studyDemographicSchema>;

export const studyDemographicDefaultData: Omit<StudyDemographicData, 'ageRange' | 'country'> &
	Partial<StudyDemographicData> = {
	genderCustom: '',
	genderWoman: false,
	genderMan: false,
	genderNonBinary: false,
	genderPreferNotToDisclose: false,
	genderPreferToSelfDescribe: false,
};
