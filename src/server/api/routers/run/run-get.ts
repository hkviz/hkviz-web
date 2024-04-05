import { TRPCError } from '@trpc/server';
import { cache } from 'react';
import { raise } from '~/lib/utils/utils';
import { db } from '~/server/db';
import { assertIsResearcher } from '../lib/researcher';
import { findRuns } from './runs-find';

export const getRun = cache(async (id: string, sessionUserId: string | null) => {
    const metadata =
        (
            await findRuns({
                db,
                filter: { id: [id] },
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

    if (metadata.visibility === 'private' && metadata.user.id !== sessionUserId) {
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
        files: metadata.files!,
    };
});

export type GetRunResult = Awaited<ReturnType<typeof getRun>>;
