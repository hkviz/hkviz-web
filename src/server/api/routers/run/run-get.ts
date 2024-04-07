import { TRPCError } from '@trpc/server';
import { cache } from 'react';
import { raise } from '~/lib/utils/utils';
import { db } from '~/server/db';
import { assertIsResearcher } from '../lib/researcher';
import { findRuns, type RunFilter } from './runs-find';

export const getRun = cache(async (id: string, sessionUserId: string | null) => {
    console.log(id);
    const isAnonymAccessKey = id.startsWith('a-');
    const filter: RunFilter = isAnonymAccessKey ? { anonymAccessKey: id.slice(2) } : { id: [id] };

    const metadata =
        (
            await findRuns({
                db,
                filter: filter,
                includeFiles: true,
                skipVisibilityCheck: true,
                currentUser: sessionUserId ? { id: sessionUserId } : undefined,
            })
        )[0] ??
        raise(
            new TRPCError({
                code: 'NOT_FOUND',
                message: 'Run not found',
            }),
        );

    if (!isAnonymAccessKey && metadata.visibility === 'private' && metadata.user.id !== sessionUserId) {
        await assertIsResearcher({
            db: db,
            userId: sessionUserId,
            makeError: () =>
                new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Run is private',
                }),
        });
    }

    return {
        ...metadata,
        user: isAnonymAccessKey ? { id: '', name: 'Anonym' } : metadata.user,
        files: metadata.files!,
    };
});

export type GetRunResult = Awaited<ReturnType<typeof getRun>>;
