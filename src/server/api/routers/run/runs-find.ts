import { z } from 'zod';
import { tagSchema, type TagCode } from '~/lib/types/tags';
import { visibilitySchema } from '~/lib/types/visibility';
import { type DB } from '~/server/db';
import { getGameStateMeta, runFilesMetaFieldsSelect, runTagFieldsSelect } from './run-column-selects';

export const runFilterSchema = z.object({
    userId: z.string().optional().nullish(),
    visibility: z.array(visibilitySchema).optional().nullish(),
    tag: z.array(tagSchema).optional().nullish(),
    archived: z.array(z.boolean()).optional().nullish(),
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
        filter.visibility != null &&
        filter.visibility.length === 1 &&
        filter.visibility.includes('public') &&
        filter.archived != null &&
        filter.archived.length === 1 &&
        filter.archived.includes(false);
    const isResearcher = currentUser?.isResearcher ?? false;

    if (!isOwnProfile && !isPublicFilter && !isResearcher) {
        throw new Error('Filter not allowed. Since it could result in non public runs of other users being returned.');
    }

    const runs = await db.query.runs.findMany({
        where: (run, { eq, and, inArray, or }) => {
            const tagFilter = filter.tag ? or(...filter.tag.map((tag) => eq(run[`tag_${tag}`], true))) : undefined;

            const conditions = [
                filter.userId ? eq(run.userId, filter.userId) : undefined,
                filter.visibility ? inArray(run.visibility, filter.visibility) : undefined,
                tagFilter,
                filter.archived ? inArray(run.archived, filter.archived) : undefined,
                eq(run.deleted, false),
            ];

            return and(...conditions.filter((c) => c != null));
        },
        columns: {
            id: true,
            description: true,
            createdAt: true,
            updatedAt: true,
            visibility: true,
            archived: true,
            ...runTagFieldsSelect,
            ...runFilesMetaFieldsSelect,
        },
        with: {
            user: {
                columns: {
                    id: true,
                    name: true,
                },
            },
        },
    });

    return runs
        .map(({ id, description, createdAt, updatedAt, visibility, archived, ...run }) => {
            const gameState = getGameStateMeta(run);
            const isBrokenSteelSoul = gameState?.permadeathMode === 2 || gameState?.lastScene === 'PermaDeath';
            const isSteelSoul = (gameState?.permadeathMode ?? 0) !== 0 || isBrokenSteelSoul;
            const isResearchView = run.user.id !== currentUser?.id && visibility === 'private';

            return {
                id,
                description,
                createdAt,
                visibility,
                tags: Object.entries(run)
                    .filter((kv) => kv[0].startsWith('tag_') && kv[1] === true)
                    .map((kv) => kv[0].slice(4)) as TagCode[],
                user: {
                    id: isResearchView ? '' : run.user.id,
                    name: isResearchView ? 'Anonym' : run.user.name ?? 'Unnamed user',
                },
                startedAt: gameState?.startedAt ?? createdAt,
                lastPlayedAt: gameState?.endedAt ?? updatedAt,
                isSteelSoul,
                isBrokenSteelSoul,
                archived,
                gameState,
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

export type RunMetadata = Awaited<ReturnType<typeof findRuns>>[number];
