import { eq, inArray, or, sql } from 'drizzle-orm';
import { type MySqlUpdateSetSource } from 'drizzle-orm/mysql-core';
import * as v from 'valibot';
import { type VisibilityCode } from '~/lib/types/visibility';
import { raise } from '~/lib/parser';
import { runFiles, runLocalIds, runs } from '~/server/db/schema';
import { runInteractionCombine, runInteractionUncombine } from './run-interaction-combine';
import { runTagFieldsSelect } from './run-column-selects';
import { updateRunMetaByFiles } from './update-run-meta';
import { action } from '@solidjs/router';
import { getUserOrThrow } from '~/lib/auth/shared';
import { db } from '../db';
import { sendMailToSupport } from '../mails';

const runCombineInputSchema = v.object({ runIds: v.array(v.pipe(v.string(), v.uuid())) });
type RunCombineInput = v.InferOutput<typeof runCombineInputSchema>;

export const runCombine = action(async (unsafeInput: RunCombineInput) => {
	'use server';
	const user = await getUserOrThrow();
	const input = v.parse(runCombineInputSchema, unsafeInput);
	if (input.runIds.length < 2) {
		throw new Error('At least two runs are required to combine');
	}

	const userId = user.id;

	const foundRuns = await db.query.runs.findMany({
		where: (run, { and, inArray }) => and(inArray(run.id, input.runIds), eq(run.userId, userId)),
		columns: {
			id: true,
			visibility: true,
			title: true,
			...runTagFieldsSelect,
		},
		orderBy: (run, { asc }) => asc(run.startedAt),
	});

	if (foundRuns.length !== input.runIds.length) {
		throw new Error("Not all runs found or don't belong to user");
	}
	try {
		const firstRun = foundRuns[0] ?? raise(new Error('Unexpected state')); // earliest created run
		const chosenId = firstRun.id;
		const runIdsWithoutChosen = input.runIds.filter((it) => it !== chosenId);

		// if a tag exists for any of the combined runs it will be added to the combined run
		const runTagUpdate: MySqlUpdateSetSource<typeof runs> = {};
		for (const run of foundRuns) {
			for (const tag of Object.keys(runTagFieldsSelect) as (keyof typeof runTagFieldsSelect)[]) {
				if (run[tag]) {
					runTagUpdate[tag] = true;
				}
			}
		}

		// the most permissive visibility of all runs is chosen
		let visibility: VisibilityCode = 'private';
		for (const run of foundRuns) {
			if (run.visibility === 'public') {
				visibility = 'public';
				break;
			}
			if (run.visibility === 'unlisted') {
				visibility = 'unlisted';
			}
		}

		// use title from earliest run with title
		let title: string | undefined = undefined;
		for (const run of foundRuns) {
			if (run.title) {
				title = run.title;
				break;
			}
		}

		await db.transaction(async (db) => {
			// update localIds
			await db
				.update(runLocalIds)
				.set({ runId: chosenId })
				.where(inArray(runLocalIds.runId, runIdsWithoutChosen));

			// update run files
			await db.update(runFiles).set({ runId: chosenId }).where(inArray(runFiles.runId, runIdsWithoutChosen));

			// mark other runs as combined
			await db
				.update(runs)
				.set({ combinedIntoRunId: chosenId, isCombinedRun: false })
				.where(
					or(
						// runs defined in input
						inArray(runs.id, runIdsWithoutChosen),
						// runs previously combined into the runs defined in input
						inArray(runs.combinedIntoRunId, runIdsWithoutChosen),
					),
				);

			await db
				.update(runs)
				.set({ isCombinedRun: true, visibility, title, ...runTagUpdate })
				.where(eq(runs.id, chosenId));

			// update run meta
			await updateRunMetaByFiles(db, firstRun.id);

			await runInteractionCombine(db, chosenId, runIdsWithoutChosen);
		});
	} catch (e) {
		console.error(`Error while combining runs. For user ${userId} and run ${input.runIds.join(', ')}`, e);
		await sendMailToSupport({
			subject: 'Run combining failed',
			text: `Run combining failed for user ${userId} and run ${input.runIds.join(', ')}. Well thats not good probably.`,
		});
		throw e;
	}
});

const runUncombineInputSchema = v.object({ runId: v.pipe(v.string(), v.uuid()) });
type RunUncombineInput = v.InferOutput<typeof runUncombineInputSchema>;

export const runUncombine = action(async (unsafeInput: RunUncombineInput) => {
	'use server';
	const user = await getUserOrThrow();
	const userId = user.id;
	const input = v.parse(runUncombineInputSchema, unsafeInput);

	try {
		const foundRun = await db.query.runs.findFirst({
			where: (run, { and, eq }) => and(eq(run.id, input.runId), eq(run.userId, userId)),
			columns: {
				id: true,
			},
		});

		if (!foundRun) {
			throw new Error('Run not found or does not belong to user');
		}

		const affectedRuns = await db.query.runs.findMany({
			where: (run, { and, eq }) =>
				and(or(eq(run.combinedIntoRunId, input.runId), eq(run.id, input.runId)), eq(run.userId, userId)),
			columns: {
				id: true,
			},
		});

		await db.transaction(async (db) => {
			// update localIds
			await db
				.update(runLocalIds)
				.set({ runId: sql`original_run_id` })
				.where(eq(runLocalIds.runId, input.runId));

			// update runs
			await db
				.update(runs)
				.set({ combinedIntoRunId: null, isCombinedRun: false })
				.where(or(eq(runs.combinedIntoRunId, input.runId), eq(runs.id, input.runId)));

			// update run files
			await db
				.update(runFiles)
				.set({
					runId: sql`(${db
						.select({ runId: runLocalIds.originalRunId })
						.from(runLocalIds)
						.where(eq(runLocalIds.localId, runFiles.localId))
						.getSQL()})`,
				})
				.where(eq(runFiles.runId, input.runId));

			// update run meta
			for (const run of affectedRuns) {
				await updateRunMetaByFiles(db, run.id);
			}

			await runInteractionUncombine(db, input.runId);
		});
	} catch (e) {
		console.error(`Error while uncombining run. For user ${userId} and run ${input.runId}`, e);
		await sendMailToSupport({
			subject: 'Run uncombining failed',
			text: `Run uncombining failed for user ${userId} and run ${input.runId}. Well thats not good probably.`,
		});
		throw e;
	}
});
