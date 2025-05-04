import * as v from 'valibot';
import { apiGet } from '../../compat-api/compat-api';
import { runDataV1Schema } from '../../compat-api/v1-api-models';

export const getRun = async (unsafeId: string) => {
    let idUnsafe = unsafeId;
    const isAnonymAccess = idUnsafe.startsWith('a-');
    if (isAnonymAccess) {
        idUnsafe = idUnsafe.slice(2);
    }
    let id = v.parse(v.pipe(v.string(), v.uuid()), idUnsafe);
    if (isAnonymAccess) {
        id = `a-${id}`;
    }

    const metadata = await apiGet(`run/${id}`, runDataV1Schema);

    return {
        ...metadata,
        files: metadata.files!,
    };
};

export type GetRunResult = Awaited<ReturnType<typeof getRun>>;
