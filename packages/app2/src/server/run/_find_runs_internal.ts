import { isNull } from 'drizzle-orm';
import * as v from 'valibot';
import { r2GetSignedDownloadUrl, r2RunPartFileKey } from '~/server/r2';
import { runSortSchema } from '~/lib/types/run-sort';
import { tagSchema, type TagCode } from '~/lib/types/tags';
import { visibilitySchema } from '~/lib/types/visibility';
import { type DB } from '~/server/db';
import { getGameStateMeta, runFilesMetaFieldsSelect, runTagFieldsSelect } from './run-column-selects';

export const runFilterSchema = v.object({
    userId: v.nullish(v.string()),
    visibility: v.nullish(v.array(visibilitySchema)),
    tag: v.nullish(v.array(tagSchema)),
    archived: v.nullish(v.array(v.boolean())),
    id: v.nullish(v.array(v.string())),
    anonymAccessKey: v.nullish(v.string()),
    sort: v.nullish(runSortSchema),
});

export type RunFilter = v.InferOutput<typeof runFilterSchema>;

interface CurrentUserFilterInfo {
    id: string;
    isResearcher?: boolean;
}

export interface FindRunsOptions {
    db: DB;
    /**
     * defaults to not logged in
     */
    currentUser?: CurrentUserFilterInfo;
    filter: RunFilter;
    /**
     * defaults to false
     */
    includeFiles?: boolean;
    /**
     * defaults to false only used in endpoint which gets a single run by id,
     * which does its own permission checks after loading.
     */
    skipVisibilityCheck?: boolean;

    /**
     * is anonym access
     */
    isAnonymAccess?: boolean;
}

export async function findRunsInternal({
    db,
    currentUser,
    filter,
    includeFiles,
    skipVisibilityCheck,
    isAnonymAccess,
}: FindRunsOptions) {
    const isOwnProfile = !!filter.userId && currentUser?.id === filter.userId;
    const isPublicFilter =
        filter.visibility != null &&
        filter.visibility.length === 1 &&
        filter.visibility.includes('public') &&
        filter.archived != null &&
        filter.archived.length === 1 &&
        filter.archived.includes(false) &&
        filter.id == null; // id filter is not allowed for public filter
    const isResearcher = currentUser?.isResearcher ?? false;

    if (!isOwnProfile && !isPublicFilter && !isResearcher && !skipVisibilityCheck) {
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
                filter.id ? inArray(run.id, filter.id) : undefined,
                filter.anonymAccessKey ? eq(run.anonymAccessKey, filter.anonymAccessKey) : undefined,
                isNull(run.combinedIntoRunId),
            ];

            return and(...conditions.filter((c) => c != null));
        },
        orderBy: (run, { desc }) => {
            const lastPlayedSort = [desc(run.endedAt), desc(run.updatedAt), desc(run.createdAt)];
            switch (filter.sort) {
                case 'favorites':
                    return [desc(run.likeCount), ...lastPlayedSort];
                default:
                    return lastPlayedSort;
            }
        },
        columns: {
            id: true,
            title: true,
            description: true,
            createdAt: true,
            updatedAt: true,
            visibility: true,
            archived: true,
            isCombinedRun: true,
            anonymAccessGameplayCutOffAt: true,
            anonymAccessTitle: true,
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
            files: !includeFiles
                ? undefined
                : {
                      columns: {
                          id: true,
                          partNumber: true,
                          uploadFinished: true,
                          version: true,
                          createdAt: true,
                      },
                      // should pretty much always sort by playTime, if it does not exist in the meta data
                      // it uses the partNumber, which breaks when a run has multiple local ids.
                      // Could in theory be hacked, and one could sort the events by timestamp afterwards,
                      // but probably should be fine.
                      orderBy: (files, { asc }) => [asc(files.playTime), asc(files.partNumber)],
                      where: (files, { eq }) => eq(files.uploadFinished, true),
                  },
            interactions: currentUser
                ? {
                      columns: {
                          type: true,
                          userId: true,
                      },
                      where: (interaction, { eq, and }) =>
                          and(eq(interaction.userId, currentUser.id), eq(interaction.type, 'like')),
                  }
                : undefined,
        },
    });

    // little cache here, just to make the same users have the same references
    // therefore the serializer can dedupe them.
    const userRefCache = new Map<string, { name: string; id: string }>();
    function getOrMakeUser(id: string, name: string) {
        let user = userRefCache.get(id);
        if (!user) {
            user = { id, name };
            userRefCache.set(id, user);
        }
        return user;
    }

    return await Promise.all(
        runs.map(
            async ({
                files,
                id,
                title,
                anonymAccessTitle,
                description,
                createdAt,
                updatedAt,
                visibility,
                archived,
                isCombinedRun,
                ...run
            }) => {
                const gameState = getGameStateMeta(run);
                const isBrokenSteelSoul = gameState?.permadeathMode === 2 || gameState?.lastScene === 'PermaDeath';
                const isSteelSoul = (gameState?.permadeathMode ?? 0) !== 0 || isBrokenSteelSoul;
                const isResearchView = run.user.id !== currentUser?.id && visibility === 'private';

                const mappedFiles = !includeFiles
                    ? undefined
                    : await Promise.all(
                          files.map(async (file, index) => ({
                              ...file,
                              signedUrl: await r2GetSignedDownloadUrl(r2RunPartFileKey(file.id)),
                              combinedPartNumber: index + 1,
                          })),
                      );

                const filteredFiles = !isAnonymAccess
                    ? mappedFiles
                    : mappedFiles?.filter(
                          (it) =>
                              run.anonymAccessGameplayCutOffAt === null ||
                              it.createdAt <= run.anonymAccessGameplayCutOffAt,
                      );

                return {
                    id,
                    title: isAnonymAccess ? anonymAccessTitle ?? title : title,
                    description,
                    createdAt,
                    visibility,
                    tags: isAnonymAccess
                        ? []
                        : (Object.entries(run)
                              .filter((kv) => kv[0].startsWith('tag_') && kv[1] === true)
                              .map((kv) => kv[0].slice(4)) as TagCode[]),
                    user: getOrMakeUser(
                        isResearchView ? '' : run.user.id,
                        isResearchView ? 'Anonym' : run.user.name ?? 'Unnamed player',
                    ),
                    startedAt: gameState?.startedAt ?? createdAt,
                    lastPlayedAt: gameState?.endedAt ?? updatedAt,
                    isSteelSoul,
                    isBrokenSteelSoul,
                    archived,
                    isCombinedRun,
                    gameState,
                    files: filteredFiles,
                    currentUserState: currentUser
                        ? {
                              hasLiked: run.interactions ? run.interactions.length > 0 : false,
                          }
                        : undefined,
                };
            },
        ),
    );
    //     .sort((a, b) => {
    //     if (a.lastPlayedAt && b.lastPlayedAt) {
    //         return b.lastPlayedAt.getTime() - a.lastPlayedAt.getTime();
    //     } else if (a.lastPlayedAt) {
    //         return -1;
    //     } else if (b.lastPlayedAt) {
    //         return 1;
    //     } else {
    //         return b.createdAt.getTime() - a.createdAt.getTime();
    //     }
    // });
}

export type RunMetadata = Awaited<ReturnType<typeof findRunsInternal>>[number];

export async function findNewRunId(db: DB, runId: string) {
    return (
        await db.query.runs.findFirst({
            where: (run, { eq }) => eq(run.id, runId),
            columns: {
                combinedIntoRunId: true,
            },
        })
    )?.combinedIntoRunId;
}
