import { relations, sql, type HasDefault, type NotNull } from 'drizzle-orm';
import {
	index,
	int,
	primaryKey,
	real,
	SQLiteBooleanBuilderInitial,
	sqliteTableCreator,
	text,
} from 'drizzle-orm/sqlite-core';
import { AccountType } from '~/lib/auth/auth-options';
import { mapZoneSchema } from '~/lib/parser';
import { ageRangeCodes } from '~/lib/types/age-range';
import { callOptionCodes } from '~/lib/types/call-option';
import { countryCodes } from '~/lib/types/country';
import { playingFrequencyCodes } from '~/lib/types/playing-frequency';
import { playingSinceCodes } from '~/lib/types/playing-since';
import { MAX_RUN_TITLE_LENGTH } from '~/lib/types/run-fields';
import { runInteractionTypes } from '~/lib/types/run-interaction';
import { tags, type TagCode } from '~/lib/types/tags';

// ---- CUSTOM TYPES ----
// uuid
const UUID_LENGTH = 36;
function uuid(name: string) {
	return text(name, { length: UUID_LENGTH });
}
// boolean
function boolean(name: string) {
	return int(name, { mode: 'boolean' });
}
// timestamp
function timestamp(name: string) {
	return int(name, { mode: 'timestamp' });
}
function createdAt(name: string = 'created_at') {
	return timestamp(name)
		.default(sql`(unixepoch())` as any)
		.notNull();
}
function updatedAt(name: string = 'updated_at') {
	return int(name, { mode: 'timestamp' }).$onUpdate(() => new Date());
}
// enum
function textEnum<const TEnum extends readonly [string, ...string[]]>(name: string, values: TEnum) {
	return text(name, { enum: values });
}
// auto increment
function intSerialPrimaryKey(name: string) {
	return int(name, { mode: 'number' }).primaryKey({ autoIncrement: true });
}

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const table = sqliteTableCreator((name) => `hkviz_${name}`);

export const users = table(
	'user',
	{
		id: text('id', { length: 255 }).notNull().primaryKey(),
		participantId: uuid('participant_id'),
		name: text('name', { length: 256 }),
		previousName: text('previous_name', { length: 255 }),
		isResearcher: boolean('is_researcher').notNull().default(false),
		email: text('email', { length: 255 }).notNull(),
		emailVerified: timestamp('email_verified').default(sql`(unixepoch())` as any),
		image: text('image', { length: 255 }),
		createdAt: createdAt(),
		updatedAt: updatedAt(),
	},
	(user) => [index('users_email_idx').on(user.email)],
);

export const usersRelations = relations(users, ({ many, one }) => ({
	accounts: many(accounts),
	dataCollectionStudyParticipation: one(dataCollectionStudyParticipations, {
		fields: [users.id],
		references: [dataCollectionStudyParticipations.userId],
	}),
	studyParticipant: one(studyParticipant, {
		fields: [users.participantId],
		references: [studyParticipant.participantId],
	}),
}));

export const accounts = table(
	'account',
	{
		userId: text('user_id', { length: 255 }).notNull(),
		type: text('type', { length: 255 }).$type<AccountType>().notNull(),
		provider: text('provider', { length: 255 }).notNull(),
		providerAccountId: text('provider_account_id', { length: 255 }).notNull(),
		refresh_token: text('refresh_token'),
		access_token: text('access_token'),
		expires_at: int('expires_at'),
		token_type: text('token_type', { length: 255 }),
		scope: text('scope', { length: 255 }),
		id_token: text('id_token'),
		session_state: text('session_state', { length: 255 }),
		createdAt: createdAt(),
		updatedAt: updatedAt(),
	},
	(account) => [
		primaryKey({ columns: [account.provider, account.providerAccountId] }),
		index('accounts_userId_idx').on(account.userId),
	],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = table(
	'session',
	{
		sessionToken: text('session_token', { length: 255 }).notNull().primaryKey(),
		userId: text('user_id', { length: 255 }).notNull(),
		expires: timestamp('expires').notNull(),
	},
	(session) => [index('userId_idx').on(session.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = table(
	'verificationToken',
	{
		identifier: text('identifier', { length: 255 }).notNull(),
		token: text('token', { length: 255 }).notNull(),
		expires: timestamp('expires').notNull(),
	},
	(vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

const runTagColumns = Object.fromEntries(
	tags.map((tag) => [`tag_${tag.code}`, boolean(`tag_${tag.code}`).notNull().default(false)]),
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
	mapZone: textEnum('map_zone', mapZoneSchema.options),
	killedHollowKnight: boolean('killed_hollow_knight'),
	killedFinalBoss: boolean('killed_final_boss'),
	killedVoidIdol: boolean('killed_void_idol'),
	completionPercentage: int('completion_percentage'),
	unlockedCompletionRate: boolean('unlocked_completion_rate'),
	dreamNailUpgraded: boolean('dream_nail_upgraded'),
	lastScene: text('last_scene', { length: 255 }),

	startedAt: timestamp('started_at'),
	endedAt: timestamp('ended_at'),
} as const;

export type RunGameStateMetaColumnName = keyof typeof runGameStateMetaColumns;

export const runs = table(
	'run',
	{
		// server generated. Used for urls
		id: text('id', { length: 255 }).notNull().primaryKey(),
		userId: text('user_id', { length: 255 }).notNull(),
		title: text('title', { length: MAX_RUN_TITLE_LENGTH }),
		description: text('description'),
		visibility: textEnum('visibility', ['public', 'unlisted', 'private']).notNull().default('private'),

		combinedIntoRunId: uuid('combined_into_run_id'),
		isCombinedRun: boolean('is_combined_run').notNull().default(false),

		anonymAccessKey: uuid('anonym_access_key'),
		anonymAccessTitle: text('anonym_access_title', {
			length: MAX_RUN_TITLE_LENGTH,
		}),
		anonymAccessGameplayCutOffAt: timestamp('anonym_access_gameplay_cut_off_At'),
		preventDeletion: boolean('prevent_deletion').notNull().default(false),

		createdAt: createdAt(),
		updatedAt: updatedAt(),

		// generally when a run is deleted, it is actually deleted from the database.
		// unless deleting a file from r2 failed, then it will be kept for manual cleanup.
		deleted: boolean('deleted').notNull().default(false),

		// will hide a run from the own gameplays and public list even when public.
		// only viewable by owner via achieve page
		archived: boolean('archived').notNull().default(false),

		likeCount: int('like_count').notNull().default(0),

		...runTagColumns,

		...runGameStateMetaColumns,
	},
	(run) => [
		index('run_userIdVisibilityDeletedArchivedCombinedIntoRunId_idx').on(
			run.userId,
			run.visibility,
			// TODO check if index is useable in archive query.
			run.deleted,
			run.archived,
			run.combinedIntoRunId,
		),
		// TODO index should have where public. Possibly add a index per tag.
		index('run_visibilityDeletedArchivedCombinedIntoRunId_idx').on(
			run.visibility,
			run.deleted,
			run.archived,
			run.combinedIntoRunId,
		),
	],
);

export const runsRelations = relations(runs, ({ one, many }) => ({
	user: one(users, { fields: [runs.userId], references: [users.id] }),
	files: many(runFiles),
	interactions: many(runInteraction),
}));

/**
 * Since a gameplay could have multiple local ids, when it is played over multiple devices
 * and the id is not synced (which it isn't atm).
 */
export const runLocalIds = table(
	'run_local_id',
	{
		localId: uuid('local_id').notNull(),
		userId: uuid('user_id').notNull(),
		runId: uuid('run_id').notNull(),
		originalRunId: uuid('original_run_id'),
	},
	(runLocalId) => [primaryKey({ columns: [runLocalId.userId, runLocalId.localId] })],
);

export const runLocalIdRelations = relations(runLocalIds, ({ one }) => ({
	user: one(users, { fields: [runLocalIds.userId], references: [users.id] }),
	run: one(runs, { fields: [runLocalIds.runId], references: [runs.id] }),
}));

export const runFiles = table(
	'runfile',
	{
		// this id is also used to find the file inside the r2 bucket
		id: uuid('id').notNull().primaryKey(),
		runId: uuid('run_id').notNull(),
		localId: uuid('local_id'),
		partNumber: int('part_number').notNull(),
		uploadFinished: boolean('upload_finished').notNull(),
		createdAt: createdAt(),
		updatedAt: updatedAt(),
		version: int('version').notNull().default(0),
		contentLength: int('content_length').notNull().default(0),
		...runGameStateMetaColumns,
	},
	(runFile) => [index('runFiles_runIdPartNumber_idx').on(runFile.runId, runFile.partNumber)],
);

export const runFilesRelations = relations(runFiles, ({ one }) => ({
	run: one(runs, { fields: [runFiles.runId], references: [runs.id] }),
}));

export const runInteraction = table(
	'runInteraction',
	{
		id: intSerialPrimaryKey('id'),
		runId: uuid('run_id').notNull(),

		userId: uuid('user_id').notNull(),
		type: textEnum('type', runInteractionTypes).notNull(),
		createdAt: createdAt(),
		updatedAt: updatedAt(),
		originalRunIds: text('original_run_ids', { mode: 'json' }).$type<string[]>().notNull(),
	},
	(runInteraction) => [
		index('runInteraction_runIdType_idx').on(runInteraction.runId, runInteraction.type, runInteraction.userId),
	],
);

export const runInteractionRelations = relations(runInteraction, ({ one }) => ({
	run: one(runs, { fields: [runInteraction.runId], references: [runs.id] }),
	user: one(users, { fields: [runInteraction.userId], references: [users.id] }),
}));

export const ingameAuth = table(
	'ingameauth',
	{
		// server generated, to authenticate a user from the game. Does only permit uploads.
		id: text('id', { length: 255 }).notNull().primaryKey(),
		// just used for the login url, since the actual id should not be inside the browser history.
		// this urlId is immediatly changed or deleted after the login url is visited, even before canceling or allowing.
		urlId: text('url_id', { length: 255 }),
		name: text('name', { length: 255 }).notNull(),
		userId: text('user_id', { length: 255 }),
		createdAt: createdAt(),
		updatedAt: updatedAt(),
	},
	(ingameAuth) => [index('ingameAuth_urlId_idx').on(ingameAuth.urlId)],
);

export const ingameAuthRelations = relations(ingameAuth, ({ one }) => ({
	user: one(users, { fields: [ingameAuth.userId], references: [users.id] }),
}));

export const accountDeletionRequest = table('accountDeletionRequest', {
	id: text('id', { length: 255 }).notNull().primaryKey(),
	userId: text('user_id', { length: 255 }).notNull(),
	createdAt: createdAt(),
	updatedAt: updatedAt(),
	formAccepted: boolean('form_accepted').notNull().default(false),
});

// data collection study:
export const dataCollectionStudyParticipations = table('userDataCollectionResearchParticipation', {
	userId: text('user_id', { length: 255 }).notNull().primaryKey(),
	excludedSinceU18: boolean('exluded_since_u18').notNull().default(false),
	keepDataAfterStudyConducted: boolean('keep_data_after_study_conducted').notNull(),
	futureContactOk: boolean('future_contact_ok').notNull(),
	createdAt: createdAt(),
	updatedAt: updatedAt(),
});

export const dataCollectionStudyParticipationRelations = relations(dataCollectionStudyParticipations, ({ one }) => ({
	user: one(users, {
		fields: [dataCollectionStudyParticipations.userId],
		references: [users.id],
	}),
}));

export const userDemographics = table(
	'userDemographic',
	{
		id: intSerialPrimaryKey('id'),
		userId: uuid('user_id'),
		participantId: uuid('participant_id'),
		ageRange: textEnum('age_range', ageRangeCodes).notNull(),
		country: textEnum('country', countryCodes).notNull(),

		genderWoman: boolean('gender_woman').notNull().default(false),
		genderMan: boolean('gender_man').notNull().default(false),
		genderNonBinary: boolean('gender_non_binary').notNull().default(false),
		genderPreferNotToDisclose: boolean('gender_prefer_not_to_disclose').notNull().default(false),
		genderPreferToSelfDescribe: boolean('gender_prefer_to_self_describe').notNull().default(false),
		genderCustom: text('gender_custom', { length: 124 }),

		createdAt: createdAt(),
		updatedAt: updatedAt(),
	},
	(userDemographic) => [
		index('userDemographics_userId_idx').on(userDemographic.userId),
		index('userDemographics_participantId_idx').on(userDemographic.participantId),
	],
);

export const userDemographicsRelations = relations(userDemographics, ({ one }) => ({
	user: one(users, {
		fields: [userDemographics.userId],
		references: [users.id],
	}),
	participant: one(studyParticipant, {
		fields: [userDemographics.participantId],
		references: [studyParticipant.participantId],
	}),
}));

export const hkExperience = table(
	'hkExperience',
	{
		id: intSerialPrimaryKey('id'),
		userId: uuid('user_id'),
		participantId: uuid('participant_id'),

		playingSince: textEnum('playing_since', playingSinceCodes),
		playingFrequency: textEnum('playing_frequency', playingFrequencyCodes),
		playedBefore: boolean('played_before').notNull(),
		gotDreamnail: boolean('got_dreamnail').notNull(),
		didEndboss: boolean('did_enboss').notNull(),
		enteredWhitePalace: boolean('entered_white_palace').notNull(),
		got112Percent: boolean('got_112_percent').notNull(),

		createdAt: createdAt(),
		updatedAt: updatedAt(),
	},
	(hkExperience) => [
		index('hkExperience_userId_idx').on(hkExperience.userId),
		index('hkExperience_participantId_idx').on(hkExperience.participantId),
	],
);

export const hkExperienceRelations = relations(hkExperience, ({ one }) => ({
	user: one(users, { fields: [hkExperience.userId], references: [users.id] }),
	participant: one(studyParticipant, {
		fields: [hkExperience.participantId],
		references: [studyParticipant.participantId],
	}),
}));

// user study:

/**
 * Each user has a participant id, but a user study participant does not need to have a user account.
 * The user account is only needed to use the mod and upload gameplays.
 */
export const studyParticipant = table('studyParticipant', {
	participantId: uuid('participant_id').notNull().primaryKey(),
	comment: text('comment', { length: 1024 }),
	createdAt: createdAt(),
	updatedAt: updatedAt(),
	skipLoginQuestion: boolean('skip_login_question').notNull().default(false),
	userStudyFinished: boolean('user_study_finished').notNull().default(false),
	resetId: uuid('reset_id'),
	callOption: textEnum('contact_type', callOptionCodes),
	callName: text('contact_name', { length: 256 }),
	timeZone: text('time_zone', { length: 256 }),
	locale: text('locale', { length: 256 }),
});
export const studyParticipantRelations = relations(studyParticipant, ({ one }) => ({
	user: one(users),
	informedConsent: one(userStudyInformedConsent),
	hkExperience: one(hkExperience),
	demographics: one(userDemographics),
	timeslot: one(userStudyTimeSlot),
}));

export const userStudyInformedConsent = table('userStudyInformedConsent', {
	participantId: uuid('participant_id').notNull().primaryKey(),
	createdAt: createdAt(),
	updatedAt: updatedAt(),
});

export const userStudyInformedConsentRelations = relations(userStudyInformedConsent, ({ one }) => ({
	participant: one(studyParticipant, {
		fields: [userStudyInformedConsent.participantId],
		references: [studyParticipant.participantId],
	}),
}));

export const userStudyTimeSlot = table('userStudyTimeSlot', {
	id: intSerialPrimaryKey('id'),
	startAt: timestamp('start_at').notNull(),
	participantId: uuid('participant_id'),
});

export const userStudyTimeSlotRelations = relations(userStudyTimeSlot, ({ one }) => ({
	participant: one(studyParticipant, {
		fields: [userStudyTimeSlot.participantId],
		references: [studyParticipant.participantId],
	}),
}));
