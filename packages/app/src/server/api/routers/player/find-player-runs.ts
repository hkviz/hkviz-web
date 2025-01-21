import { cache } from 'react';
import { findRuns } from '../run/runs-find';

export const findPlayerPublicRuns = async (id: string) => {
    return await findRuns({
        filter: {
            userId: id,
        },
    });
};
