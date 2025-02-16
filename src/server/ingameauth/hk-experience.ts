import { action, json, query } from '@solidjs/router';
import * as v from 'valibot';
import { getUserOrThrow } from '~/lib/auth/shared';
import { HkExperience, hkExperienceFinished, hkExperienceSchema } from '~/lib/types/hk-experience';
import { db } from '../db';
import { hkExperience } from '../db/schema';
import { getIngameAuthFlowState, getIngameAuthRedirect } from './ingameauth-flow-state';

export const hkExperienceGet = query(async () => {
	'use server';
	const user = await getUserOrThrow();
	const userId = user.id;

	return await db.query.hkExperience.findFirst({
		columns: {
			playingSince: true,
			playingFrequency: true,
			gotDreamnail: true,
			didEndboss: true,
			enteredWhitePalace: true,
			got112Percent: true,
		},
		where: (hkExperience, { eq }) => eq(hkExperience.userId, userId),
	});
}, 'hkExperience');

export const hkExperienceSave = action(async (dataUnsafe: HkExperience) => {
	'use server';
	const user = await getUserOrThrow();
	const userId = user.id;
	const data = v.parse(hkExperienceSchema, dataUnsafe);

	if (!hkExperienceFinished(data)) {
		throw new Error('Experience form not finished');
	}

	const existing = await db.query.hkExperience.findFirst({
		where: (hkExperience, { eq }) => eq(hkExperience.userId, userId!),
		columns: {
			id: true,
			userId: true,
			participantId: true,
		},
	});

	if (existing) throw new Error('Experience already exists');

	const values = {
		...data,
		playedBefore: data.playingSince !== 'never',
		userId: userId,
	};

	const result = //existing
		//? await db.update(hkExperience).set(values).where(eq(hkExperience.id, existing.id))
		// :
		await db.insert(hkExperience).values(values);

	if (result.rowsAffected !== 1) {
		throw new Error('Could not save hk experience');
	}

	const flow = await getIngameAuthFlowState();
	if (flow.type === 'no-id-provided') {
		// should just stay on page, and display success message
		return json(true, {
			revalidate: ['nothing'],
		});
	}

	return await getIngameAuthRedirect(flow);
});
