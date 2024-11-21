import { raise } from '~/lib/parser';
import { db } from '~/server/db';
import { findRunsInternal, type RunFilter } from './_find_runs_internal';
import { cache } from '@solidjs/router';
import { assertIsResearcher } from '../researcher';
import { getUserOrNull } from '../auth';

export const getRun = cache(async (id: string) => {
    'use server';
    const sessionUser = await getUserOrNull();

    // console.log(id);
    const isAnonymAccessKey = id.startsWith('a-');
    const filter: RunFilter = isAnonymAccessKey ? { anonymAccessKey: id.slice(2) } : { id: [id] };

    const metadata =
        (
            await findRunsInternal({
                db,
                filter: filter,
                includeFiles: true,
                skipVisibilityCheck: true,
                currentUser: sessionUser?.id ? { id: sessionUser.id } : undefined,
                isAnonymAccess: isAnonymAccessKey,
            })
        )[0] ?? raise(new Error('Run not found'));

    if (!isAnonymAccessKey && metadata.visibility === 'private' && metadata.user.id !== sessionUser?.id) {
        await assertIsResearcher({
            db: db,
            userId: sessionUser?.id ?? null,
            makeError: () => new Error('Run is private'),
        });
    }

    return {
        ...metadata,
        user: isAnonymAccessKey ? { id: '', name: 'Anonym' } : metadata.user,
        files: metadata.files!,
    };
}, 'run');

export type GetRunResult = Awaited<ReturnType<typeof getRun>>;
