import { cache } from '@solidjs/router';
import { getUserOrNull } from '../auth';
import { db } from '../db';
import { findRuns } from './runs-find';

export const findOwnRuns = cache(async () => {
    'use server';
    const user = await getUserOrNull();
    if (!user) {
        return [];
    }

    console.log('findOwnRuns', user.id);

    return await findRuns({
        db,
        currentUser: { id: user.id },
        filter: { userId: user.id, archived: [false] },
        includeFiles: false,
    });
}, 'own-runs');
