import { cache } from 'react';
import { db } from '~/server/db';
import { findRuns } from '../run/runs-find';

export const findPlayerPublicRuns = cache(async (id: string) => {
    return await findRuns({
        db,
        filter: {
            visibility: ['public'],
            userId: id,
            archived: [false],
        },
    });
});
