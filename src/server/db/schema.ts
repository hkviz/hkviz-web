import { relations, sql, type HasDefault, type NotNull } from 'drizzle-orm';
import {
    boolean,
    double,
    index,
    int,
    mysqlEnum,
    mysqlTableCreator,
    primaryKey,
    text,
    timestamp,
    varchar,
    type MySqlBooleanBuilderInitial,
} from 'drizzle-orm/mysql-core';
import { type AdapterAccount } from 'next-auth/adapters';
import { ageRangeCodes } from '~/lib/types/age-range';
import { countryCodes } from '~/lib/types/country';
import { MAX_RUN_TITLE_LENGTH } from '~/lib/types/run-fields';
import { tags, type TagCode } from '~/lib/types/tags';
import { mapZoneSchema } from '~/lib/viz/types/mapZone';

const UUID_LENGTH = 36;
function varcharUuid(name: string) {
    return varchar(name, { length: UUID_LENGTH });
}

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const mysqlTable = mysqlTableCreator((name) => `hkviz_${name}`);

export const users = mysqlTable('user', {
    id: varchar('id', { length: 255 }).notNull().primaryKey(),
    name: varchar('name', { length: 255 }),
    previousName: varchar('previous_name', { length: 255 }),
    isResearcher: boolean('is_researcher').notNull().default(false),
    email: varchar('email', { length: 255 }).notNull(),
    emailVerified: timestamp('emailVerified', {
        mode: 'date',
        fsp: 3,
    }).default(sql`CURRENT_TIMESTAMP(3)`),
    image: varchar('image', { length: 255 }),
    createdAt: timestamp('created_at')
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp('updatedAt').onUpdateNow(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
    accounts: many(accounts),
    dataCollectionStudyParticipation: one(dataCollectionStudyParticipations, {
        fields: [users.id],
        references: [dataCollectionStudyParticipations.userId],
    }),
}));

export const accounts = mysqlTable(
    'account',
    {
        userId: varchar('userId', { length: 255 }).notNull(),
        type: varchar('type', { length: 255 }).$type<AdapterAccount['type']>().notNull(),
        provider: varchar('provider', { length: 255 }).notNull(),
        providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),
        refresh_token: text('refresh_token'),
        access_token: text('access_token'),
        expires_at: int('expires_at'),
        token_type: varchar('token_type', { length: 255 }),
        scope: varchar('scope', { length: 255 }),
        id_token: text('id_token'),
        session_state: varchar('session_state', { length: 255 }),
        createdAt: timestamp('created_at')
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp('updatedAt').onUpdateNow(),
    },
    (account) => ({
        compoundKey: primaryKey(account.provider, account.providerAccountId),
        userIdIdx: index('userId_idx').on(account.userId),
    }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
    user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const dataCollectionStudyParticipations = mysqlTable('userDataCollectionResearchParticipation', {
    userId: varchar('userId', { length: 255 }).notNull().primaryKey(),
    excludedSinceU18: boolean('exludedSinceU18').notNull().default(false),
    keepDataAfterStudyConducted: boolean('keepDataAfterStudyConducted').notNull(),
    futureContactOk: boolean('futureContactOk').notNull(),
    createdAt: timestamp('created_at')
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp('updatedAt').onUpdateNow(),
});

export const dataCollectionStudyParticipationRelations = relations(dataCollectionStudyParticipations, ({ one }) => ({
    user: one(users, { fields: [dataCollectionStudyParticipations.userId], references: [users.id] }),
}));

export const userDemographics = mysqlTable('userDemographic', {
    userId: varchar('userId', { length: 255 }).notNull().primaryKey(),
    ageRange: mysqlEnum('age_range', ageRangeCodes).notNull(),
    country: mysqlEnum('country', countryCodes).notNull(),

    genderWoman: boolean('gender_woman').notNull().default(false),
    genderMan: boolean('gender_man').notNull().default(false),
    genderNonBinary: boolean('gender_non_binary').notNull().default(false),
    genderPreferNotToDisclose: boolean('gender_prefer_not_to_disclose').notNull().default(false),
    genderPreferToSelfDescribe: boolean('gender_prefer_to_self_describe').notNull().default(false),
    genderCustom: varchar('gender_custom', { length: 124 }),

    createdAt: timestamp('created_at')
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp('updatedAt').onUpdateNow(),
});

export const hkExperience = mysqlTable('hkExperience', {
    userId: varchar('userId', { length: 255 }).notNull().primaryKey(),

    playedBefore: boolean('played_before').notNull(),
    gotDreamnail: boolean('got_dreamnail').notNull(),
    didEndboss: boolean('did_enboss').notNull(),
    enteredWhitePalace: boolean('entered_white_palace').notNull(),
    got112Percent: boolean('got_112_percent').notNull(),

    createdAt: timestamp('created_at')
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp('updatedAt').onUpdateNow(),
});

export const userDemographicsRelations = relations(userDemographics, ({ one }) => ({
    user: one(users, { fields: [userDemographics.userId], references: [users.id] }),
}));

export const sessions = mysqlTable(
    'session',
    {
        sessionToken: varchar('sessionToken', { length: 255 }).notNull().primaryKey(),
        userId: varchar('userId', { length: 255 }).notNull(),
        expires: timestamp('expires', { mode: 'date' }).notNull(),
    },
    (session) => ({
        userIdIdx: index('userId_idx').on(session.userId),
    }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = mysqlTable(
    'verificationToken',
    {
        identifier: varchar('identifier', { length: 255 }).notNull(),
        token: varchar('token', { length: 255 }).notNull(),
        expires: timestamp('expires', { mode: 'date' }).notNull(),
    },
    (vt) => ({
        compoundKey: primaryKey(vt.identifier, vt.token),
    }),
);

const runTagColumns = Object.fromEntries(
    tags.map((tag) => [`tag_${tag.code}`, boolean(`tag_${tag.code}`).notNull().default(false)]),
) as {
    [Code in TagCode as `tag_${Code}`]: HasDefault<NotNull<MySqlBooleanBuilderInitial<`tag_${Code}`>>>;
};

// meta data, so it can easily be displayed in the UI without parsing recording files
const runGameStateMetaColumns = {
    hkVersion: varchar('hk_version', { length: 64 }),
    playTime: double('play_time'),
    maxHealth: int('max_health'),
    mpReserveMax: int('mp_reserve_max'),
    geo: int('geo'),
    dreamOrbs: int('dream_orbs'),
    permadeathMode: int('permadeath_mode'),
    mapZone: mysqlEnum('map_zone', mapZoneSchema.options),
    killedHollowKnight: boolean('killed_hollow_knight'),
    killedFinalBoss: boolean('killed_final_boss'),
    killedVoidIdol: boolean('killed_void_idol'),
    completionPercentage: int('completion_percentage'),
    unlockedCompletionRate: boolean('unlocked_completion_rate'),
    dreamNailUpgraded: boolean('dream_nail_upgraded'),
    lastScene: varchar('last_scene', { length: 255 }),

    startedAt: timestamp('started_at'),
    endedAt: timestamp('ended_at'),
} as const;

export type RunGameStateMetaColumnName = keyof typeof runGameStateMetaColumns;

export const runs = mysqlTable(
    'run',
    {
        // server generated. Used for urls
        id: varchar('id', { length: 255 }).notNull().primaryKey(),
        userId: varchar('user_id', { length: 255 }).notNull(),
        title: varchar('title', { length: MAX_RUN_TITLE_LENGTH }),
        description: text('description'),
        visibility: mysqlEnum('visibility', ['public', 'unlisted', 'private']).notNull().default('private'),

        combinedIntoRunId: varcharUuid('combined_into_run_id'),
        isCombinedRun: boolean('is_combined_run').notNull().default(false),

        createdAt: timestamp('created_at')
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp('updatedAt').onUpdateNow(),

        // generally when a run is deleted, it is actually deleted from the database.
        // unless deleting a file from r2 failed, then it will be kept for manual cleanup.
        deleted: boolean('deleted').notNull().default(false),

        // will hide a run from the own gameplays and public list even when public.
        // only viewable by owner via achieve page
        archived: boolean('archived').notNull().default(false),

        ...runTagColumns,

        ...runGameStateMetaColumns,
    },
    (run) => ({
        userIdIdx: index('userId_idx').on(run.userId),
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
export const runLocalIds = mysqlTable(
    'run_local_id',
    {
        localId: varcharUuid('local_id').notNull(),
        userId: varcharUuid('user_id').notNull(),
        runId: varcharUuid('run_id').notNull(),
        originalRunId: varcharUuid('original_run_id'),
    },
    (runLocalId) => ({
        compoundKey: primaryKey(runLocalId.userId, runLocalId.localId),
    }),
);

export const runLocalIdRelations = relations(runLocalIds, ({ one, many }) => ({
    user: one(users, { fields: [runLocalIds.userId], references: [users.id] }),
    run: one(runs, { fields: [runLocalIds.runId], references: [runs.id] }),
}));

export const runFiles = mysqlTable(
    'runfile',
    {
        // this id is also used to find the file inside the r2 bucket
        id: varcharUuid('id').notNull().primaryKey(),
        runId: varcharUuid('run_id').notNull(),
        // TODO make non-nullable after deploy
        localId: varcharUuid('local_id'),
        partNumber: int('part_number').notNull(),
        uploadFinished: boolean('upload_finished').notNull(),
        createdAt: timestamp('created_at')
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp('updatedAt').onUpdateNow(),
        version: int('version').notNull().default(0),
        contentLength: int('content_length').notNull().default(0),
        ...runGameStateMetaColumns,
    },
    (runFile) => ({
        runIdIdx: index('runId_idx').on(runFile.runId),
        runIdPartNumberIdx: index('runIdPartNumber_idx').on(runFile.runId, runFile.partNumber),
    }),
);

export const runFilesRelations = relations(runFiles, ({ one }) => ({
    run: one(runs, { fields: [runFiles.runId], references: [runs.id] }),
}));

export const ingameAuth = mysqlTable(
    'ingameauth',
    {
        // server generated, to authenticate a user from the game. Does only permit uploads.
        id: varchar('id', { length: 255 }).notNull().primaryKey(),
        // just used for the login url, since the actual id should not be inside the browser history.
        // this urlId is immediatly changed or deleted after the login url is visited, even before canceling or allowing.
        urlId: varchar('url_id', { length: 255 }),
        name: varchar('name', { length: 255 }).notNull(),
        userId: varchar('user_id', { length: 255 }),
        createdAt: timestamp('created_at')
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp('updatedAt').onUpdateNow(),
    },
    (ingameAuth) => ({
        urlIdIdx: index('urlId_idx').on(ingameAuth.urlId),
    }),
);

export const ingameAuthRelations = relations(ingameAuth, ({ one }) => ({
    user: one(users, { fields: [ingameAuth.userId], references: [users.id] }),
}));

export const accountDeletionRequest = mysqlTable('accountDeletionRequest', {
    id: varchar('id', { length: 255 }).notNull().primaryKey(),
    userId: varchar('user_id', { length: 255 }).notNull(),
    createdAt: timestamp('created_at')
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp('updatedAt').onUpdateNow(),
    formAccepted: boolean('form_accepted').notNull().default(false),
});
