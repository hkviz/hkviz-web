import { type InferSelectModel } from 'drizzle-orm';
import { MapZoneHollow } from '~/lib/game-data/hollow-data/map-zone-hollow';
import { MapZoneSilk } from '~/lib/game-data/silk-data/map-zone-silk';
import { assertNever } from '~/lib/parser';
import { GameId } from '~/lib/types/game-ids';
import { tags, type TagCode } from '~/lib/types/tags';
import { type RunGameStateMetaColumnName, type runFiles, type runs } from '~/server/db/schema';

type RunFileColumnSelect = Partial<{ [Col in keyof typeof runFiles]: true }>;
type RunColumnSelect = Partial<{ [Col in keyof typeof runs]: true }>;

export const runFilesMetaFieldsSelect = {
	gameVersion: true,
	playTime: true,
	maxHealth: true,
	mpReserveMax: true,
	geo: true,
	dreamOrbs: true,
	permadeathMode: true,
	mapZone: true,
	killedHollowKnight: true,
	killedFinalBoss: true,
	killedVoidIdol: true,
	completionPercentage: true,
	unlockedCompletionRate: true,
	dreamNailUpgraded: true,
	lastScene: true,

	startedAt: true,
	endedAt: true,
} satisfies RunFileColumnSelect;

export const runTagFieldsSelect = Object.fromEntries(tags.map((tag) => [`tag_${tag.code}`, true])) as {
	[Code in TagCode as `tag_${Code}`]: true;
} satisfies RunColumnSelect;

export const runGameStateMetaColumnsSelect = {
	gameVersion: true,
	playTime: true,
	maxHealth: true,
	mpReserveMax: true,
	geo: true,
	dreamOrbs: true,
	permadeathMode: true,
	mapZone: true,
	killedHollowKnight: true,
	killedFinalBoss: true,
	killedVoidIdol: true,
	completionPercentage: true,
	unlockedCompletionRate: true,
	dreamNailUpgraded: true,
	lastScene: true,

	startedAt: true,
	endedAt: true,
} as const satisfies {
	[Col in RunGameStateMetaColumnName]: true;
} satisfies RunColumnSelect satisfies RunFileColumnSelect;

type RunGameStateUnmapped = Pick<InferSelectModel<typeof runs>, RunGameStateMetaColumnName>;

type RunGameStateBase = Omit<RunGameStateUnmapped, 'mapZone'>;
export interface RunGameStateHollow extends RunGameStateBase {
	game: 'hollow';
	mapZone: MapZoneHollow | null;
}

export interface RunGameStateSilk extends RunGameStateBase {
	game: 'silk';
	mapZone: MapZoneSilk | null;
}

export type RunGameStateMeta = RunGameStateHollow | RunGameStateSilk;

export function getGameStateMeta(game: GameId, run: RunGameStateUnmapped): RunGameStateMeta {
	const base = {
		gameVersion: run.gameVersion,
		playTime: run.playTime,
		maxHealth: run.maxHealth,
		mpReserveMax: run.mpReserveMax,
		geo: run.geo,
		dreamOrbs: run.dreamOrbs,
		permadeathMode: run.permadeathMode,
		killedHollowKnight: run.killedHollowKnight,
		killedFinalBoss: run.killedFinalBoss,
		killedVoidIdol: run.killedVoidIdol,
		completionPercentage: run.completionPercentage,
		unlockedCompletionRate: run.unlockedCompletionRate,
		dreamNailUpgraded: run.dreamNailUpgraded,
		lastScene: run.lastScene,

		startedAt: run.startedAt,
		endedAt: run.endedAt,
	};

	if (game === 'hollow') {
		return { ...base, game: 'hollow', mapZone: run.mapZone as MapZoneHollow | null };
	} else if (game === 'silk') {
		return { ...base, game: 'silk', mapZone: run.mapZone as MapZoneSilk | null };
	}
	return assertNever(game);
}
