import { v4 as uuidv4 } from 'uuid';

import { and, eq } from 'drizzle-orm';
import * as v from 'valibot';
import { isModVersionBefore1_6_0, mapZoneSchema, ModVersion, raise } from '~/lib/parser';
import { r2RunPartFileKey } from '~/lib/r2';
import { runFiles, runs, type RunGameStateMetaColumnName } from '~/server/db/schema';
import { db } from '../db';
import { getUserIdFromIngameSession } from '../ingameauth/utils';
import { r2FileHead, r2GetSignedUploadUrl } from '../r2';
import { getOrCreateRunId } from './get-or-create-run-id';
import { runGameStateMetaColumnsSelect } from './run-column-selects';

const runPartCreateInputSchema = v.object({
	modVersion: v.nullish(v.string()), // provided starting with mod version 1.6.x.x

	ingameAuthId: v.pipe(v.string(), v.uuid()),
	localRunId: v.pipe(v.string(), v.uuid()),
	partNumber: v.pipe(v.number(), v.integer(), v.minValue(0)),

	hkVersion: v.nullish(v.pipe(v.string(), v.maxLength(64))),
	playTime: v.nullish(v.number()),
	maxHealth: v.nullish(v.pipe(v.number(), v.integer())),
	mpReserveMax: v.nullish(v.pipe(v.number(), v.integer())),
	geo: v.nullish(v.pipe(v.number(), v.integer())),
	dreamOrbs: v.nullish(v.pipe(v.number(), v.integer())),
	permadeathMode: v.nullish(v.pipe(v.number(), v.integer())),
	mapZone: v.nullish(mapZoneSchema),
	killedHollowKnight: v.nullish(v.boolean()),
	killedFinalBoss: v.nullish(v.boolean()),
	killedVoidIdol: v.nullish(v.boolean()),
	completionPercentage: v.nullish(v.pipe(v.number(), v.integer())),
	unlockedCompletionRate: v.nullish(v.boolean()),
	dreamNailUpgraded: v.nullish(v.boolean()),
	lastScene: v.nullish(v.pipe(v.string(), v.maxLength(255))),

	firstUnixSeconds: v.nullish(v.number()),
	lastUnixSeconds: v.nullish(v.number()),
});
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
	const input = v.parse(runPartCreateInputSchema, unsafeInput);
	const userId = await getUserIdFromIngameSession(db, input.ingameAuthId);
	const runId = await getOrCreateRunId(db, input.localRunId, userId);

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
		if (!input.modVersion || isModVersionBefore1_6_0(input.modVersion as ModVersion)) {
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
			runPartMarkFinished({
				ingameAuthId: input.ingameAuthId,
				localRunId: input.localRunId,
				fileId: existingFile.id,
			});
			if (!input.modVersion || isModVersionBefore1_6_0(input.modVersion as ModVersion)) {
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

	await db.insert(runFiles).values({
		id: fileId,
		runId,
		localId: input.localRunId,
		partNumber: input.partNumber,
		uploadFinished: false,
		version: 0,

		hkVersion: input.hkVersion,
		playTime: input.playTime,
		maxHealth: input.maxHealth,
		mpReserveMax: input.mpReserveMax,
		geo: input.geo,
		dreamOrbs: input.dreamOrbs,
		permadeathMode: input.permadeathMode,
		mapZone: input.mapZone,

		killedHollowKnight: input.killedHollowKnight,
		killedFinalBoss: input.killedFinalBoss,
		killedVoidIdol: input.killedVoidIdol,
		completionPercentage: input.completionPercentage,
		unlockedCompletionRate: input.unlockedCompletionRate,
		dreamNailUpgraded: input.dreamNailUpgraded,
		lastScene: input.lastScene,

		startedAt: input.firstUnixSeconds ? new Date(input.firstUnixSeconds * 1000) : null,
		endedAt: input.lastUnixSeconds ? new Date(input.lastUnixSeconds * 1000) : null,
	});
	return {
		fileId,
		runId,
		signedUploadUrl: await r2GetSignedUploadUrl(r2RunPartFileKey(fileId)),
		alreadyFinished: false,
	};
}

const runPartMarkFinishedInputSchema = v.object({
	ingameAuthId: v.pipe(v.string(), v.uuid()),
	localRunId: v.pipe(v.string(), v.uuid()),
	fileId: v.pipe(v.string(), v.uuid()),
});
type RunPartMarkFinishedInput = v.InferOutput<typeof runPartMarkFinishedInputSchema>;

interface RunPartMarkFinishedResult {
	alreadyFinished: boolean;
}

export async function runPartMarkFinished(unsafeInput: RunPartMarkFinishedInput): Promise<RunPartMarkFinishedResult> {
	const input = v.parse(runPartMarkFinishedInputSchema, unsafeInput);
	const userId = await getUserIdFromIngameSession(db, input.ingameAuthId);
	const runId = await getOrCreateRunId(db, input.localRunId, userId);

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
					hkVersion: file.hkVersion ?? run.hkVersion,
					playTime: file.playTime ?? run.playTime,
					maxHealth: file.maxHealth ?? run.maxHealth,
					mpReserveMax: file.mpReserveMax ?? run.mpReserveMax,
					geo: file.geo ?? run.geo,
					dreamOrbs: file.dreamOrbs ?? run.dreamOrbs,
					permadeathMode: file.permadeathMode ?? run.permadeathMode,
					mapZone: file.mapZone ?? run.mapZone,
					killedHollowKnight: file.killedHollowKnight ?? run.killedHollowKnight,
					killedFinalBoss: file.killedFinalBoss ?? run.killedFinalBoss,
					killedVoidIdol: file.killedVoidIdol ?? run.killedVoidIdol,
					completionPercentage: file.completionPercentage ?? run.completionPercentage,
					unlockedCompletionRate: file.unlockedCompletionRate ?? run.unlockedCompletionRate,
					dreamNailUpgraded: file.dreamNailUpgraded ?? run.dreamNailUpgraded,
					lastScene: file.lastScene ?? run.lastScene,

					startedAt: run.startedAt ?? file.startedAt,
					endedAt: file.endedAt ?? run.endedAt,
				} satisfies { [Col in RunGameStateMetaColumnName]: unknown })
				.where(eq(runs.id, runId));
		}
	} catch (ex) {
		console.error('Could not update run meta from file', ex);
	}

	return { alreadyFinished: false };
}
