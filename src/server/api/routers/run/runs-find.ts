import { z } from 'zod';
import { tagSchema, type TagCode } from '~/lib/types/tags';
import { visibilitySchema } from '~/lib/types/visibility';
import { type DB } from '~/server/db';
import { runFilesMetaFieldsSelect, runTagFieldsSelect } from './run-column-selects';

export const runFilterSchema = z.object({
    userId: z.string().optional().nullish(),
    visibility: z.array(visibilitySchema).optional().nullish(),
    tag: z.array(tagSchema).optional().nullish(),
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
        where: (run, { eq, and, inArray, or }) => {
            console.log(filter);
            const tagFilter = filter.tag ? or(...filter.tag.map((tag) => eq(run[`tag_${tag}`], true))) : undefined;

            const conditions = [
                filter.userId ? eq(run.userId, filter.userId) : undefined,
                filter.visibility ? inArray(run.visibility, filter.visibility) : undefined,
                tagFilter,
            ];

            const c = and(...conditions.filter((c) => c != null));
            // console.log(c);
            return c;
        },
        columns: {
            id: true,
            description: true,
            createdAt: true,
            visibility: true,
            ...runTagFieldsSelect,
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
                    ...runFilesMetaFieldsSelect,
                },
                orderBy: (files, { asc }) => [asc(files.partNumber)],
                where: (files, { eq }) => eq(files.uploadFinished, true),
            },
        },
    });

    return runs
        .map(({ files, id, description, createdAt, visibility, ...run }) => {
            const firstFile = files[0];
            const lastFile = files.at(-1);
            const isBrokenSteelSoul = firstFile?.permadeathMode === 2 || lastFile?.lastScene === 'PermaDeath';
            const isSteelSoul = (firstFile?.permadeathMode ?? 0) !== 0 || isBrokenSteelSoul;
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
