// Genders from https://www.reimaginegender.org/insights/gender-and-forms

import * as v from 'valibot';
import { type CodesOf } from './_utils';

export const playingSinceOptions = [
	{
		code: 'never',
		name: 'I have never played Hollow Knight',
	},
	{
		code: 'less_than_a_month',
		name: 'Less than a month ago',
	},
	{
		code: '1_to_6_months',
		name: '1 to 6 months ago',
	},
	{
		code: 'more_than_6_months_less_than_2_years',
		name: 'More than 6 months but less than 2 years ago',
	},
	{
		code: '2_years_or_more',
		name: '2 years ago or more',
	},
] as const;

type PlayingSinceCodes = CodesOf<typeof playingSinceOptions>;
export type PlayingSinceCode = PlayingSinceCodes[number];
export const playingSinceCodes = playingSinceOptions.map((it) => it.code) as unknown as PlayingSinceCodes;

export const playingSinceCodeSchema = v.picklist(playingSinceCodes);

const playingSinceByCode = new Map(playingSinceOptions.map((it) => [it.code, it]));

export function playingSinceName(code: PlayingSinceCode): string {
	return playingSinceByCode.get(code)!.name;
}
