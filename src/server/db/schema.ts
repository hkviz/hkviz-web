import { relations, type HasDefault, type NotNull } from 'drizzle-orm';
import {
    index,
    int,
    primaryKey,
    real,
    sqliteTableCreator,
    text,
    type SQLiteBooleanBuilderInitial,
    type SQLiteTimestampBuilderInitial,
} from 'drizzle-orm/sqlite-core';
import { type AdapterAccount } from 'next-auth/adapters';
import { type AgeRange } from '~/lib/types/age-range';
import { type CountryCode } from '~/lib/types/country';
import { MAX_RUN_TITLE_LENGTH } from '~/lib/types/run-fields';
import { tags, type TagCode } from '~/lib/types/tags';
import { type VisibilityCode } from '~/lib/types/visibility';
import { type MapZone } from '~/lib/viz/types/mapZone';

const UUID_LENGTH = 36;
function textUuid<const TName extends string>(name: TName) {
    return text(name, { length: UUID_LENGTH });
}

function timestampColumn<const TName extends string>(name: TName) {
    return int(name, { mode: 'timestamp' });
}

function createdAtColumn(): HasDefault<NotNull<SQLiteTimestampBuilderInitial<'created_at'>>> {
    return timestampColumn('created_at')
        .notNull()
        .$default(() => new Date());
}

function updatedAtColumn(): HasDefault<SQLiteTimestampBuilderInitial<'updated_at'>> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return timestampColumn('updated_at').$onUpdate(() => new Date());
}

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `hkviz_${name}`);

export const users = createTable(
    'user',
    {
        id: text('id', { length: 255 }).notNull().primaryKey(),
        name: text('name', { length: 255 }),
        previousName: text('previous_name', { length: 255 }),
        isResearcher: int('is_researcher', { mode: 'boolean' }).notNull().default(false),
        email: text('email', { length: 255 }).notNull(),
        emailVerified: timestampColumn('email_verified'),
        image: text('image', { length: 255 }),
        createdAt: createdAtColumn(),
        updatedAt: updatedAtColumn(),
    },
    (user) => ({
        emailIdx: index('email_idx').on(user.email),
    }),
);

export const usersRelations = relations(users, ({ many, one }) => ({
    accounts: many(accounts),
    dataCollectionStudyParticipation: one(dataCollectionStudyParticipations, {
        fields: [users.id],
        references: [dataCollectionStudyParticipations.userId],
    }),
}));

export const accounts = createTable(
    'account',
    {
        userId: text('user_id', { length: 255 }).notNull(),
        type: text('type', { length: 255 }).$type<AdapterAccount['type']>().notNull(),
        provider: text('provider', { length: 255 }).notNull(),
        providerAccountId: text('provider_account_id', { length: 255 }).notNull(),
        refresh_token: text('refresh_token'),
        access_token: text('access_token'),
        expires_at: int('expires_at'),
        token_type: text('token_type', { length: 255 }),
        scope: text('scope', { length: 255 }),
        id_token: text('id_token'),
        session_state: text('session_state', { length: 255 }),
        createdAt: createdAtColumn(),
        updatedAt: updatedAtColumn(),
    },
    (account) => ({
        compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
        userIdIdx: index('accounts_userId_idx').on(account.userId),
    }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
    user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const dataCollectionStudyParticipations = createTable('userDataCollectionResearchParticipation', {
    userId: text('userId', { length: 255 }).notNull().primaryKey(),
    excludedSinceU18: int('exluded_since_u18', { mode: 'boolean' }).notNull().default(false),
    keepDataAfterStudyConducted: int('keep_data_after_study_conducted', { mode: 'boolean' }).notNull(),
    futureContactOk: int('future_contact_ok', { mode: 'boolean' }).notNull(),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
});

export const dataCollectionStudyParticipationRelations = relations(dataCollectionStudyParticipations, ({ one }) => ({
    user: one(users, { fields: [dataCollectionStudyParticipations.userId], references: [users.id] }),
}));

export const userDemographics = createTable('userDemographic', {
    userId: text('user_id', { length: 255 }).notNull().primaryKey(),
    ageRange: text('age_range', { length: 64 }).$type<AgeRange>().notNull(),
    country: text('country', { length: 2 }).$type<CountryCode>().notNull(),

    genderWoman: int('gender_woman', { mode: 'boolean' }).notNull().default(false),
    genderMan: int('gender_man', { mode: 'boolean' }).notNull().default(false),
    genderNonBinary: int('gender_non_binary', { mode: 'boolean' }).notNull().default(false),
    genderPreferNotToDisclose: int('gender_prefer_not_to_disclose', { mode: 'boolean' }).notNull().default(false),
    genderPreferToSelfDescribe: int('gender_prefer_to_self_describe', { mode: 'boolean' }).notNull().default(false),
    genderCustom: text('gender_custom', { length: 124 }),

    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
});

export const hkExperience = createTable('hkExperience', {
    userId: text('userId', { length: 255 }).notNull().primaryKey(),

    playedBefore: int('played_before', { mode: 'boolean' }).notNull(),
    gotDreamnail: int('got_dreamnail', { mode: 'boolean' }).notNull(),
    didEndboss: int('did_enboss', { mode: 'boolean' }).notNull(),
    enteredWhitePalace: int('entered_white_palace', { mode: 'boolean' }).notNull(),
    got112Percent: int('got_112_percent', { mode: 'boolean' }).notNull(),

    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
});

export const userDemographicsRelations = relations(userDemographics, ({ one }) => ({
    user: one(users, { fields: [userDemographics.userId], references: [users.id] }),
}));

export const sessions = createTable(
    'session',
    {
        sessionToken: text('session_token', { length: 255 }).notNull().primaryKey(),
        userId: text('user_id', { length: 255 }).notNull(),
        expires: timestampColumn('expires').notNull(),
    },
    (session) => ({
        userIdIdx: index('sessions_userId_idx').on(session.userId),
    }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
    'verificationToken',
    {
        identifier: text('identifier', { length: 255 }).notNull(),
        token: text('token', { length: 255 }).notNull(),
        expires: timestampColumn('expires').notNull(),
    },
    (vt) => ({
        compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
    }),
);

const runTagColumns = Object.fromEntries(
    tags.map((tag) => [`tag_${tag.code}`, int(`tag_${tag.code}`, { mode: 'boolean' }).notNull().default(false)]),
) as {
    [Code in TagCode as `tag_${Code}`]: HasDefault<NotNull<SQLiteBooleanBuilderInitial<`tag_${Code}`>>>;
};

// meta data, so it can easily be displayed in the UI without parsing recording files
const runGameStateMetaColumns = {
    hkVersion: text('hk_version', { length: 64 }),
    playTime: real('play_time'),
    maxHealth: int('max_health'),
    mpReserveMax: int('mp_reserve_max'),
    geo: int('geo'),
    dreamOrbs: int('dream_orbs'),
    permadeathMode: int('permadeath_mode'),
    mapZone: text('map_zone', { length: 255 }).$type<MapZone>(),
    killedHollowKnight: int('killed_hollow_knight', { mode: 'boolean' }),
    killedFinalBoss: int('killed_final_boss', { mode: 'boolean' }),
    killedVoidIdol: int('killed_void_idol', { mode: 'boolean' }),
    completionPercentage: int('completion_percentage'),
    unlockedCompletionRate: int('unlocked_completion_rate', { mode: 'boolean' }),
    dreamNailUpgraded: int('dream_nail_upgraded', { mode: 'boolean' }),
    lastScene: text('last_scene', { length: 255 }),

    startedAt: timestampColumn('started_at'),
    endedAt: timestampColumn('ended_at'),
} as const;

export type RunGameStateMetaColumnName = keyof typeof runGameStateMetaColumns;

export const runs = createTable(
    'run',
    {
        // server generated. Used for urls
        id: text('id', { length: 255 }).notNull().primaryKey(),
        userId: text('user_id', { length: 255 }).notNull(),
        title: text('title', { length: MAX_RUN_TITLE_LENGTH }),
        description: text('description'),
        visibility: text('visibility', { length: 64 }).$type<VisibilityCode>().notNull().default('private'),

        combinedIntoRunId: textUuid('combined_into_run_id'),
        isCombinedRun: int('is_combined_run', { mode: 'boolean' }).notNull().default(false),

        createdAt: createdAtColumn(),
        updatedAt: updatedAtColumn(),

        // generally when a run is deleted, it is actually deleted from the database.
        // unless deleting a file from r2 failed, then it will be kept for manual cleanup.
        deleted: int('deleted', { mode: 'boolean' }).notNull().default(false),

        // will hide a run from the own gameplays and public list even when public.
        // only viewable by owner via achieve page
        archived: int('archived', { mode: 'boolean' }).notNull().default(false),

        ...runTagColumns,

        ...runGameStateMetaColumns,
    },
    (run) => ({
        userIdVisibilityDeletedArchivedCombinedIntoRunIdIdx: index(
            'userIdVisibilityDeletedArchivedCombinedIntoRunId_idx',
        ).on(run.userId, run.visibility, run.deleted, run.archived, run.combinedIntoRunId),
        visibilityDeletedArchivedCombinedIntoRunIdIdx: index('visibilityDeletedArchivedCombinedIntoRunId_idx').on(
            run.visibility,
            run.deleted,
            run.archived,
            run.combinedIntoRunId,
        ),
    }),
);

export const runsRelations = relations(runs, ({ one, many }) => ({
    user: one(users, { fields: [runs.userId], references: [users.id] }),
    files: many(runFiles),
}));

/**
 * Since a gameplay could have multiple local ids, when it is played over multiple devices
 * and the id is not synced (which it isn't atm).
 */
export const runLocalIds = createTable(
    'run_local_id',
    {
        localId: textUuid('local_id').notNull(),
        userId: textUuid('user_id').notNull(),
        runId: textUuid('run_id').notNull(),
        originalRunId: textUuid('original_run_id'),
    },
    (runLocalId) => ({
        compoundKey: primaryKey({ columns: [runLocalId.userId, runLocalId.localId] }),
    }),
);

export const runLocalIdRelations = relations(runLocalIds, ({ one, many }) => ({
    user: one(users, { fields: [runLocalIds.userId], references: [users.id] }),
    run: one(runs, { fields: [runLocalIds.runId], references: [runs.id] }),
}));

export const runFiles = createTable(
    'runfile',
    {
        // this id is also used to find the file inside the r2 bucket
        id: textUuid('id').notNull().primaryKey(),
        runId: textUuid('run_id').notNull(),
        // TODO make non-nullable after deploy
        localId: textUuid('local_id'),
        partNumber: int('part_number').notNull(),
        uploadFinished: int('upload_finished', { mode: 'boolean' }).notNull(),
        createdAt: createdAtColumn(),
        updatedAt: updatedAtColumn(),
        version: int('version').notNull().default(0),
        contentLength: int('content_length').notNull().default(0),
        ...runGameStateMetaColumns,
    },
    (runFile) => ({
        runIdPartNumberIdx: index('runIdPartNumber_idx').on(runFile.runId, runFile.partNumber),
    }),
);

export const runFilesRelations = relations(runFiles, ({ one }) => ({
    run: one(runs, { fields: [runFiles.runId], references: [runs.id] }),
}));

export const ingameAuth = createTable(
    'ingameauth',
    {
        // server generated, to authenticate a user from the game. Does only permit uploads.
        id: text('id', { length: 255 }).notNull().primaryKey(),
        // just used for the login url, since the actual id should not be inside the browser history.
        // this urlId is immediatly changed or deleted after the login url is visited, even before canceling or allowing.
        urlId: text('url_id', { length: 255 }),
        name: text('name', { length: 255 }).notNull(),
        userId: text('user_id', { length: 255 }),
        createdAt: createdAtColumn(),
        updatedAt: updatedAtColumn(),
    },
    (ingameAuth) => ({
        urlIdIdx: index('urlId_idx').on(ingameAuth.urlId),
    }),
);

export const ingameAuthRelations = relations(ingameAuth, ({ one }) => ({
    user: one(users, { fields: [ingameAuth.userId], references: [users.id] }),
}));

export const accountDeletionRequest = createTable('accountDeletionRequest', {
    id: text('id', { length: 255 }).notNull().primaryKey(),
    userId: text('user_id', { length: 255 }).notNull(),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
    formAccepted: int('form_accepted', { mode: 'boolean' }).notNull().default(false),
});
