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
    unique,
    varchar,
    type MySqlBooleanBuilderInitial,
} from 'drizzle-orm/mysql-core';
import { type AdapterAccount } from 'next-auth/adapters';
import { ageRangeCodes } from '~/lib/types/age-range';
import { countryCodes } from '~/lib/types/country';
import { genderCodes } from '~/lib/types/gender';
import { hkExperienceCodes } from '~/lib/types/old-hk-experience';
import { oldTagCodes } from '~/lib/types/old-tags';
import { tags, type TagCode } from '~/lib/types/tags';
import { mapZoneSchema } from '~/lib/viz/types/mapZone';

const UUID_LENGTH = 36;

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

    previousHollowKnightExperience: mysqlEnum('previous_hollow_knight_experience', hkExperienceCodes).notNull(),
    ageRange: mysqlEnum('age_range', ageRangeCodes).notNull(),
    gender: mysqlEnum('gender', genderCodes).notNull(),
    genderCustom: varchar('gender_custom', { length: 124 }),
    country: mysqlEnum('country', countryCodes).notNull(),

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

export const runs = mysqlTable(
    'run',
    {
        // server generated. Used for urls
        id: varchar('id', { length: 255 }).notNull().primaryKey(),

        // user generated
        localId: varchar('run_id', { length: 255 }).notNull(),

        userId: varchar('user_id', { length: 255 }).notNull(),

        // // id used for key in r2 bucket
        // bucketFileId: varchar('fileId', { length: 255 }).notNull(),

        description: text('description'),
        createdAt: timestamp('created_at')
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp('updatedAt').onUpdateNow(),
        visibility: mysqlEnum('visibility', ['public', 'unlisted', 'private']).notNull().default('private'),

        ...runTagColumns,
    },
    (run) => ({
        userIdIdx: index('userId_idx').on(run.userId),
        uniqueLocalIdUserId: unique('uniqueLocalIdUserId').on(run.localId, run.userId),
    }),
);

export const runsRelations = relations(runs, ({ one, many }) => ({
    user: one(users, { fields: [runs.userId], references: [users.id] }),
    files: many(runFiles),
}));

export const runFiles = mysqlTable('runfile', {
    // this id is also used to find the file inside the r2 bucket
    id: varchar('id', { length: UUID_LENGTH }).notNull().primaryKey(),
    runId: varchar('run_id', { length: UUID_LENGTH }).notNull(),
    partNumber: int('part_number').notNull(),
    uploadFinished: boolean('upload_finished').notNull(),
    createdAt: timestamp('created_at')
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp('updatedAt').onUpdateNow(),
    version: int('version').notNull().default(0),
    contentLength: int('content_length').notNull().default(0),

    // meta data, so it can easily be displayed in the UI without parsing recording files
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
});

export const runFilesRelations = relations(runFiles, ({ one }) => ({
    run: one(runs, { fields: [runFiles.runId], references: [runs.id] }),
}));

export const runTags = mysqlTable(
    'runTag',
    {
        runId: varchar('run_id', { length: UUID_LENGTH }).notNull(),
        code: mysqlEnum('tag', oldTagCodes).notNull(),
    },
    (runTag) => ({
        compoundKey: primaryKey(runTag.runId, runTag.code),
    }),
);

export const runTagsRelations = relations(runTags, ({ one, many }) => ({
    run: one(runs, { fields: [runTags.runId], references: [runs.id] }),
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
    (session) => ({
        urlIdIdx: index('urlId_idx').on(session.urlId),
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
