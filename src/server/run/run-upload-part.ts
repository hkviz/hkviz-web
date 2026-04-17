import { v4 as uuidv4 } from 'uuid';

import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';
import { mapZoneSchemaHollow } from '~/lib/game-data/hollow-data/map-zone-hollow';
import {
	BellhomePaintColoursNumberSchemaSilk,
	ExtraRestZonesNumberSchemaSilk,
} from '~/lib/game-data/silk-data/player-data-silk.generated';
import { ModVersionHollow, isModVersionBefore1_6_0Hollow, raise } from '~/lib/parser';
import { r2RunPartFileKey } from '~/lib/r2';
import { gameIdSchemaHollowDefault } from '~/lib/types/game-ids';
import { hollowOrSilkMapZoneSchema } from '~/lib/types/map-zone';
import { runFiles, runs, type RunGameStateMetaColumnName } from '~/server/db/schema';
import { db } from '../db';
import { getUserIdFromIngameSession } from '../ingameauth/utils';
import { r2FileHead, r2GetSignedUploadUrl } from '../r2';
import { getOrCreateRunId } from './get-or-create-run-id';
import { RunFileInsertMustGs, runGameStateMetaColumnsSelect } from './run-column-selects';

const runPartCreateBaseInputSchema = {
	modVersion: v.nullish(v.string()), // provided starting with mod version 1.6.x.x
	game: gameIdSchemaHollowDefault,

	ingameAuthId: v.pipe(v.string(), v.uuid()),
	localRunId: v.pipe(v.string(), v.uuid()),
	partNumber: v.pipe(v.number(), v.integer(), v.minValue(0)),

	playTime: v.nullish(v.number()),
	firstUnixSeconds: v.nullish(v.number()),
	lastUnixSeconds: v.nullish(v.number()),

	// bools
	unlockedCompletionRate: v.nullish(v.boolean()),

	// ints
	completionPercentage: v.nullish(v.pipe(v.number(), v.integer())),
	maxHealth: v.nullish(v.pipe(v.number(), v.integer())),
	geo: v.nullish(v.pipe(v.number(), v.integer())),
	permadeathMode: v.nullish(v.pipe(v.number(), v.integer())),

	// strings
	lastScene: v.nullish(v.pipe(v.string(), v.maxLength(255))),
};

const runPartCreateInputSchema = v.variant('game', [
	v.object({
		...runPartCreateBaseInputSchema,
		game: v.literal('hollow'),
		hkVersion: v.nullish(v.pipe(v.string(), v.maxLength(64))),
		mapZone: v.nullish(mapZoneSchemaHollow),

		// bools
		killedHollowKnight: v.nullish(v.boolean()), // bool 1
		killedFinalBoss: v.nullish(v.boolean()), // bool 2
		killedVoidIdol: v.nullish(v.boolean()), // bool 3
		dreamNailUpgraded: v.nullish(v.boolean()), // bool 4

		// ints
		dreamOrbs: v.nullish(v.pipe(v.number(), v.integer())), // int 1
		mpReserveMax: v.nullish(v.pipe(v.number(), v.integer())), // int 2
	}),
	v.object({
		...runPartCreateBaseInputSchema,
		game: v.literal('silk'),
		gameVersion: v.nullish(v.pipe(v.string(), v.maxLength(64))),
		mapZone: v.nullish(hollowOrSilkMapZoneSchema),

		// bools
		endingAct2Regular: v.nullish(v.boolean()), // bool 1
		endingAct2Cursed: v.nullish(v.boolean()), // bool 2
		endingAct2SoulSnare: v.nullish(v.boolean()), // bool 3
		endingAct3: v.nullish(v.boolean()), // bool 4
		isAct3: v.nullish(v.boolean()), // bool 5

		// ints
		shellShards: v.nullish(v.pipe(v.number(), v.integer())), // int 1
		silkSpoolParts: v.nullish(v.pipe(v.number(), v.integer())), // int 2
		extraRestZones: v.nullish(ExtraRestZonesNumberSchemaSilk), // int 3
		belltownHouseColour: v.nullish(BellhomePaintColoursNumberSchemaSilk), // int 4

		// strings
		currentCrestId: v.nullish(v.pipe(v.string(), v.maxLength(64))), // string 1
	}),
]);

type RunPartCreateInput = v.InferOutput<typeof runPartCreateInputSchema>;

interface RunPartCreateResult {
	fileId: string;
	runId: string;
	signedUploadUrl: string;
	/**
	 * File was already uploaded to bucket and marked as finished.
	 * Save to mark as completed on client without performing further steps.
	 * Will only be true for mod versions >= 1.6, since older versions
	 * Would not handle it correctly.
	 */
	alreadyFinished: boolean;
}

export async function runPartCreate(unsafeInput: RunPartCreateInput): Promise<RunPartCreateResult> {
	console.log('Creating run part for runId', unsafeInput);
	unsafeInput.game ??= 'hollow';
	const input = v.parse(runPartCreateInputSchema, unsafeInput);
	const userId = await getUserIdFromIngameSession(db, input.ingameAuthId);
	const runId = await getOrCreateRunId(db, input.localRunId, userId, input.game);

	// if there is already a row for that part we can use it
	const existingFile = await db.query.runFiles.findFirst({
		where: (runFiles, { and, eq }) =>
			and(
				eq(runFiles.runId, runId),
				eq(runFiles.partNumber, input.partNumber),
				eq(runFiles.localId, input.localRunId),
			),
		columns: {
			id: true,
			uploadFinished: true,
		},
	});

	if (existingFile?.uploadFinished) {
		if (!input.modVersion || isModVersionBefore1_6_0Hollow(input.modVersion as ModVersionHollow)) {
			// old versions don't check for the 'alreadyFinished' flag
			// so for those versions, the previous behavior is kept.
			throw new Error('File already uploaded');
		} else {
			return { fileId: existingFile.id, runId, signedUploadUrl: '', alreadyFinished: true };
		}
	} else if (existingFile) {
		// here either the mark finish call failed / did not happen, but the bucket upload succeeded
		// or the bucket upload failed / was not attempted.

		// first lets try finishing the upload, which only succeeds if the file is in the bucket
		try {
			await runPartMarkFinished({
				game: input.game,
				ingameAuthId: input.ingameAuthId,
				localRunId: input.localRunId,
				fileId: existingFile.id,
			});
			if (
				input.game === 'hollow' &&
				(!input.modVersion || isModVersionBefore1_6_0Hollow(input.modVersion as ModVersionHollow))
			) {
				throw new Error('File already uploaded');
			} else {
				return {
					fileId: existingFile.id,
					runId,
					signedUploadUrl: '',
					alreadyFinished: true,
				};
			}
		} catch (error: unknown) {
			console.log(
				'Attemped to mark finished in existing file for upload failed. User will get signed url again',
				error,
			);
			return {
				fileId: existingFile.id,
				runId,
				signedUploadUrl: await r2GetSignedUploadUrl(r2RunPartFileKey(existingFile.id)),
				alreadyFinished: false,
			};
		}
	}

	const fileId = uuidv4();

	const isSilk = input.game === 'silk';

	await db.insert(runFiles).values({
		gameVersion: input.game === 'hollow' ? input.hkVersion : input.gameVersion,

		id: fileId,
		runId,
		localId: input.localRunId,
		partNumber: input.partNumber,
		uploadFinished: false,
		version: 0,

		// -- shared --
		// time
		playTime: input.playTime,
		startedAt: input.firstUnixSeconds ? new Date(input.firstUnixSeconds * 1000) : null,
		endedAt: input.lastUnixSeconds ? new Date(input.lastUnixSeconds * 1000) : null,

		// bools
		unlockedCompletionRate: input.unlockedCompletionRate,

		// ints
		completionPercentage: input.completionPercentage,
		maxHealth: input.maxHealth,
		geo: input.geo,
		permadeathMode: input.permadeathMode,

		// strings
		lastScene: input.lastScene,

		// -- game specific --
		mapZone: input.mapZone,

		// bools
		gsBool1: isSilk ? input.endingAct2Regular : input.killedHollowKnight,
		gsBool2: isSilk ? input.endingAct2Cursed : input.killedFinalBoss,
		gsBool3: isSilk ? input.endingAct2SoulSnare : input.killedVoidIdol,
		gsBool4: isSilk ? input.endingAct3 : input.dreamNailUpgraded,
		gsBool5: isSilk ? input.isAct3 : null,

		// ints
		gsInt1: isSilk ? input.shellShards : input.dreamOrbs,
		gsInt2: isSilk ? input.silkSpoolParts : input.mpReserveMax,
		gsInt3: isSilk ? input.extraRestZones : null,
		gsInt4: isSilk ? input.belltownHouseColour : null,

		// strings
		gsString1: isSilk ? input.currentCrestId : null,
	} satisfies RunFileInsertMustGs);
	return {
		fileId,
		runId,
		signedUploadUrl: await r2GetSignedUploadUrl(r2RunPartFileKey(fileId)),
		alreadyFinished: false,
	};
}

const runPartMarkFinishedInputSchema = v.object({
	ingameAuthId: v.pipe(v.string(), v.uuid()),
	game: gameIdSchemaHollowDefault,
	localRunId: v.pipe(v.string(), v.uuid()),
	fileId: v.pipe(v.string(), v.uuid()),
});
type RunPartMarkFinishedInput = v.InferOutput<typeof runPartMarkFinishedInputSchema>;

interface RunPartMarkFinishedResult {
	alreadyFinished: boolean;
}

export async function runPartMarkFinished(unsafeInput: RunPartMarkFinishedInput): Promise<RunPartMarkFinishedResult> {
	console.log('Finish run part for runId', unsafeInput);
	const input = v.parse(runPartMarkFinishedInputSchema, unsafeInput);
	const userId = await getUserIdFromIngameSession(db, input.ingameAuthId);
	const runId = await getOrCreateRunId(db, input.localRunId, userId, input.game);

	// first get to make sure file belongs to user and is not already marked as finished
	const file =
		(await db.query.runFiles.findFirst({
			where: (runFiles, { and, eq }) => and(eq(runFiles.id, input.fileId), eq(runFiles.runId, runId)),
			columns: {
				id: true,
				partNumber: true,
				uploadFinished: true,
				...runGameStateMetaColumnsSelect,
			},
		})) ?? raise(new Error('File not found'));

	if (file.uploadFinished) {
		return { alreadyFinished: true };
	}

	const head = await r2FileHead(r2RunPartFileKey(input.fileId));
	if (!head) {
		throw new Error('File not found in r2 bucket. Not marked as finished');
	}

	const result = await db
		.update(runFiles)
		.set({ uploadFinished: true, version: 1, contentLength: head.ContentLength })
		.where(and(eq(runFiles.id, input.fileId), eq(runFiles.runId, runId)));

	if (result.rowsAffected !== 1) {
		throw new Error('File not found');
	}

	try {
		const run =
			(await db.query.runs.findFirst({
				where: (run, { eq }) => eq(run.id, runId),
				columns: {
					id: true,
					...runGameStateMetaColumnsSelect,
				},
			})) ?? raise(new Error('Run not found'));

		if ((run.playTime ?? -1) < (file.playTime ?? 0)) {
			await db
				.update(runs)
				.set({
					gameVersion: file.gameVersion ?? run.gameVersion,

					// -- shared --
					// time
					playTime: file.playTime ?? run.playTime,
					startedAt: run.startedAt ?? file.startedAt,
					endedAt: file.endedAt ?? run.endedAt,

					// bools
					unlockedCompletionRate: file.unlockedCompletionRate ?? run.unlockedCompletionRate,

					// ints
					completionPercentage: file.completionPercentage ?? run.completionPercentage,
					maxHealth: file.maxHealth ?? run.maxHealth,
					geo: file.geo ?? run.geo,
					permadeathMode: file.permadeathMode ?? run.permadeathMode,

					// strings
					lastScene: file.lastScene ?? run.lastScene,

					// -- game specific --
					mapZone: file.mapZone ?? run.mapZone,

					// bools
					gsBool1: file.gsBool1 ?? run.gsBool1,
					gsBool2: file.gsBool2 ?? run.gsBool2,
					gsBool3: file.gsBool3 ?? run.gsBool3,
					gsBool4: file.gsBool4 ?? run.gsBool4,
					gsBool5: file.gsBool5 ?? run.gsBool5,

					// ints
					gsInt1: file.gsInt1 ?? run.gsInt1,
					gsInt2: file.gsInt2 ?? run.gsInt2,
					gsInt3: file.gsInt3 ?? run.gsInt3,
					gsInt4: file.gsInt4 ?? run.gsInt4,

					// strings
					gsString1: file.gsString1 ?? run.gsString1,
				} satisfies { [Col in RunGameStateMetaColumnName]: unknown })
				.where(eq(runs.id, runId));
		}
	} catch (ex) {
		console.error('Could not update run meta from file', ex);
	}

	return { alreadyFinished: false };
}
