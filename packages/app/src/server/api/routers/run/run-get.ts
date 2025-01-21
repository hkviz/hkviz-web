import { z } from 'zod';
import { apiGet } from '../../compat-api/compat-api';
import { runDataV1Schema } from '../../compat-api/v1-api-models';

export const getRun = async (unsafeId: string) => {
    const id = z.string().uuid().parse(unsafeId);

    const metadata = await apiGet(`run/${id}`, runDataV1Schema);

    return {
        ...metadata,
        files: metadata.files!,
    };
};

export type GetRunResult = Awaited<ReturnType<typeof getRun>>;
