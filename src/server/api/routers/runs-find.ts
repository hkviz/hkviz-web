import { z } from 'zod';
import { visibilitySchema } from '~/lib/types/visibility';
import { type DB } from '~/server/db';

export const runFilesMetaFields = {
    hkVersion: true,
    playTime: true,
    maxHealth: true,
    mpReserveMax: true,
    geo: true,
    dreamOrbs: true,
    permadeathMode: true,
    mapZone: true,
    killedHollowKnight: true,
    killedFinalBoss: true,
    killedVoidIdol: true,
    completionPercentage: true,
    unlockedCompletionRate: true,
    dreamNailUpgraded: true,
    lastScene: true,
} as const;

export const runFilterSchema = z.object({
    userId: z.string().optional(),
    visibility: z.array(visibilitySchema).optional(),
});

export type RunFilter = z.infer<typeof runFilterSchema>;

interface CurrentUserFilterInfo {
    id: string;
    isResearcher?: boolean;
}

export interface FindRunsOptions {
    db: DB;
    currentUser?: CurrentUserFilterInfo;
    filter: RunFilter;
}

export async function findRuns({ db, currentUser, filter }: FindRunsOptions) {
    const isOwnProfile = !!filter.userId && currentUser?.id === filter.userId;
    const isPublicFilter =
        filter.visibility != null && filter.visibility.length === 1 && filter.visibility.includes('public');
    const isResearcher = currentUser?.isResearcher ?? false;

    if (!isOwnProfile && !isPublicFilter && !isResearcher) {
        throw new Error('Filter not allowed. Since it could result in non public runs of other users being returned.');
    }

    const runs = await db.query.runs.findMany({
        where: (run, { eq, and, inArray }) => {
            const conditions = [
                filter.userId ? eq(run.userId, filter.userId) : undefined,
                filter.visibility ? inArray(run.visibility, filter.visibility) : undefined,
            ];
            const c = and(...conditions.filter((c) => c != null));
            console.log(c);
            return c;
        },
        columns: {
            id: true,
            description: true,
            createdAt: true,
            visibility: true,
        },
        with: {
            user: {
                columns: {
                    id: true,
                    name: true,
                },
            },
            files: {
                columns: {
                    createdAt: true,
                    startedAt: true,
                    endedAt: true,
                    ...runFilesMetaFields,
                },
                orderBy: (files, { asc }) => [asc(files.partNumber)],
                where: (files, { eq }) => eq(files.uploadFinished, true),
            },
            tags: {
                columns: {
                    code: true,
                },
            },
        },
    });

    return runs
        .map(({ files, ...run }) => {
            const firstFile = files[0];
            const lastFile = files.at(-1);
            const isBrokenSteelSoul = firstFile?.permadeathMode === 2 || lastFile?.lastScene === 'PermaDeath';
            const isSteelSoul = (firstFile?.permadeathMode ?? 0) !== 0 || isBrokenSteelSoul;
            const isResearchView = run.user.id !== currentUser?.id && run.visibility === 'private';

            return {
                ...run,
                tags: run.tags.map((it) => it.code),
                user: {
                    id: isResearchView ? '' : run.user.id,
                    name: isResearchView ? 'Anonym' : run.user.name ?? 'Unnamed user',
                },
                startedAt: firstFile?.startedAt ?? firstFile?.createdAt,
                lastPlayedAt: lastFile?.endedAt ?? lastFile?.createdAt,
                lastFile,
                isSteelSoul,
                isBrokenSteelSoul,
            };
        })
        .sort((a, b) => {
            if (a.lastPlayedAt && b.lastPlayedAt) {
                return b.lastPlayedAt.getTime() - a.lastPlayedAt.getTime();
            } else if (a.lastPlayedAt) {
                return -1;
            } else if (b.lastPlayedAt) {
                return 1;
            } else {
                return b.createdAt.getTime() - a.createdAt.getTime();
            }
        });
}
