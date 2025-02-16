import { action, query } from '@solidjs/router';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';
import { getWebRequest } from 'vinxi/http';
import { getUserOrThrow } from '~/lib/auth/shared';
import { countryByNameIfExists, CountryCode } from '~/lib/types/country';
import { StudyDemographicData, studyDemographicSchema } from '~/lib/types/study-demographic-data';
import { db } from '../db';
import { userDemographics } from '../db/schema';
import { getIngameAuthFlowState, getIngameAuthRedirect } from './ingameauth-flow-state';

export type DemographicsUserState =
	| { type: 'exists'; data: StudyDemographicData }
	| { type: 'not-exists'; inferredCountryCode: CountryCode | undefined };

export const demographicsGetUserState = query(async (): Promise<DemographicsUserState> => {
	'use server';
	const user = await getUserOrThrow();
	const userId = user.id;

	const data = await db.query.userDemographics.findFirst({
		where: (userDemographics, { eq }) => eq(userDemographics.userId, userId),
	});

	if (data) {
		return {
			type: 'exists',
			data: {
				ageRange: data.ageRange,
				genderWoman: data.genderWoman,
				genderMan: data.genderMan,
				genderNonBinary: data.genderNonBinary,
				genderPreferNotToDisclose: data.genderPreferNotToDisclose,
				genderPreferToSelfDescribe: data.genderPreferToSelfDescribe,
				genderCustom: data.genderCustom ?? '',
				country: data.country,
			},
		};
	}

	const request = getWebRequest();
	const possibleCountryCode = request.headers.get('X-Vercel-IP-Country') ?? request.headers.get('CF-IPCountry');
	const country = countryByNameIfExists(possibleCountryCode);

	return {
		type: 'not-exists',
		inferredCountryCode: country?.code,
	};
}, 'demographics');

export const demographicsSave = action(async (dataUnsafe: StudyDemographicData) => {
	'use server';
	const data = v.parse(studyDemographicSchema, dataUnsafe);
	const user = await getUserOrThrow();
	const userId = user.id;

	const existing = await db.query.userDemographics.findFirst({
		where: (userDemographics, { eq }) => eq(userDemographics.userId, userId!),
		columns: {
			id: true,
			userId: true,
			participantId: true,
		},
	});

	const values = {
		...data,
		userId: userId ?? existing?.userId,
		participantId: existing?.participantId,
	};

	const result = existing
		? await db.update(userDemographics).set(values).where(eq(userDemographics.id, existing.id))
		: await db.insert(userDemographics).values(values);

	if (result.rowsAffected !== 1) {
		throw new Error('Could not save demographics');
	}

	const flow = await getIngameAuthFlowState();
	if (flow.type === 'no-id-provided') {
		// should just stay on page, and display success message
		return true;
	}

	return await getIngameAuthRedirect(flow);
});
