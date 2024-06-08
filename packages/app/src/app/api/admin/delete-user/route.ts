import { eq } from 'drizzle-orm';
import { assertIsResearcher } from '~/server/api/routers/lib/researcher';
import { deleteRun } from '~/server/api/routers/run/run-deletion';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';
import {
    accountDeletionRequest,
    accounts,
    hkExperience,
    ingameAuth,
    runInteraction,
    sessions,
    userDemographics,
} from '~/server/db/schema';
import { apiFromServer } from '~/trpc/from-server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const session = await getServerAuthSession();
    if (!session) throw new Error('No session found');
    await assertIsResearcher({ db, userId: session.user.id });

    if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid userId');
    }

    const deletionRequest = await db.query.accountDeletionRequest.findFirst({
        where: (accountDeletionRequest, { eq }) => eq(accountDeletionRequest.userId, userId),
    });
    if (!deletionRequest) {
        throw new Error('No deletion request found');
    }

    const runs = await db.query.runs.findMany({
        where: (runs, { eq }) => eq(runs.userId, userId),
        columns: {
            id: true,
        },
    });

    for (const run of runs) {
        await deleteRun({ userId, runId: run.id });
    }

    const runInteractions = await db.query.runInteraction.findMany({
        where: (runInteraction, { eq }) => eq(runInteraction.userId, userId),
        columns: {
            id: true,
            runId: true,
            type: true,
        },
    });

    for (const interaction of runInteractions) {
        if (interaction.type === 'like') {
            await (await apiFromServer()).runInteraction.unlike({ runId: interaction.runId });
        }
    }
    await db.delete(runInteraction).where(eq(runInteraction.userId, userId));
    await db.delete(sessions).where(eq(sessions.userId, userId));

    await db.delete(hkExperience).where(eq(hkExperience.userId, userId));
    await db.delete(userDemographics).where(eq(userDemographics.userId, userId));
    await db.delete(accounts).where(eq(accounts.userId, userId));
    await db.delete(ingameAuth).where(eq(ingameAuth.userId, userId));
    await db.delete(accountDeletionRequest).where(eq(accountDeletionRequest.userId, userId));

    return new Response('ok');
}
