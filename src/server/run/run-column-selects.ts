import { type InferSelectModel } from 'drizzle-orm';
import { SQLiteInsertValue } from 'drizzle-orm/sqlite-core';
import { MapZoneHollow } from '~/lib/game-data/hollow-data/map-zone-hollow';
import { MapZoneSilk } from '~/lib/game-data/silk-data/map-zone-silk';
import { BellhomePaintColoursSilk, ExtraRestZonesSilk } from '~/lib/game-data/silk-data/player-data-silk.generated';
import { assertNever } from '~/lib/parser';
import { GameId } from '~/lib/types/game-ids';
import { tags, type TagCode } from '~/lib/types/tags';
import { type RunGameStateMetaColumnName, type runFiles, type runs } from '~/server/db/schema';

type RunFileColumnSelect = Partial<{ [Col in keyof typeof runFiles]: true }>;
type RunColumnSelect = Partial<{ [Col in keyof typeof runs]: true }>;
type RunColumnSelectAllGs = {
	[Col in RunGameStateMetaColumnName]: true;
};

export type RunInsertMustGs = { [Col in RunGameStateMetaColumnName]: unknown } & SQLiteInsertValue<typeof runs>;
export type RunFileInsertMustGs = { [Col in RunGameStateMetaColumnName]: unknown } & SQLiteInsertValue<typeof runFiles>;

export const runFilesMetaFieldsSelect = {
	gameVersion: true,
	// -- shared --
	// time
	playTime: true,
	startedAt: true,
	endedAt: true,

	// bools
	unlockedCompletionRate: true,

	// ints
	completionPercentage: true,
	maxHealth: true,
	geo: true,
	permadeathMode: true,

	// strings
	lastScene: true,

	// -- game specific --
	mapZone: true,

	// bools
	gsBool1: true,
	gsBool2: true,
	gsBool3: true,
	gsBool4: true,
	gsBool5: true,

	// ints
	gsInt1: true,
	gsInt2: true,
	gsInt3: true,
	gsInt4: true,

	// strings
	gsString1: true,
} as const satisfies RunFileColumnSelect satisfies RunColumnSelect satisfies RunColumnSelectAllGs;

export const runTagFieldsSelect = Object.fromEntries(tags.map((tag) => [`tag_${tag.code}`, true])) as {
	[Code in TagCode as `tag_${Code}`]: true;
} satisfies RunColumnSelect;

export const runGameStateMetaColumnsSelect = {
	gameVersion: true,
	playTime: true,
	startedAt: true,
	endedAt: true,

	// -- shared --
	unlockedCompletionRate: true,
	maxHealth: true,
	geo: true,
	permadeathMode: true,
	completionPercentage: true,
	lastScene: true,

	// -- game specific --
	mapZone: true,

	// bools
	gsBool1: true,
	gsBool2: true,
	gsBool3: true,
	gsBool4: true,
	gsBool5: true,

	// ints
	gsInt1: true,
	gsInt2: true,
	gsInt3: true,
	gsInt4: true,

	// strings
	gsString1: true,
} as const satisfies {
	[Col in RunGameStateMetaColumnName]: true;
} satisfies RunColumnSelect satisfies RunFileColumnSelect;

type RunGameStateUnmapped = Pick<InferSelectModel<typeof runs>, RunGameStateMetaColumnName>;

interface RunGameStateBase {
	gameVersion: string | null;

	// -- shared --
	// time
	playTime: number | null;
	startedAt: Date | null;
	endedAt: Date | null;

	// bools
	unlockedCompletionRate: boolean | null;

	// ints
	completionPercentage: number | null;
	maxHealth: number | null;
	geo: number | null;
	permadeathMode: number | null;

	// strings
	lastScene: string | null;
}
export interface RunGameStateHollow extends RunGameStateBase {
	game: 'hollow';
	mapZone: MapZoneHollow | null;

	// bools
	killedHollowKnight: boolean; // bool 1
	killedFinalBoss: boolean; // bool 2
	killedVoidIdol: boolean; // bool 3
	dreamNailUpgraded: boolean; // bool 4

	// ints
	dreamOrbs: number; // int 1
	mpReserveMax: number; // int 2
}

export interface RunGameStateSilk extends RunGameStateBase {
	game: 'silk';
	mapZone: MapZoneSilk | null;

	// bools
	endingAct2Regular: boolean; // bool 1
	endingAct2Cursed: boolean; // bool 2
	endingAct2SoulSnare: boolean; // bool 3
	endingAct3: boolean; // bool 4
	isAct3: boolean; // bool 5

	// ints
	shellShards: number; // int 1
	silkSpoolParts: number; // int 2
	extraRestZones: number; // int 3
	belltownHouseColour: number | null; // int 4

	// strings
	currentCrestId: string | null; // string 1
}

export type RunGameStateMeta = RunGameStateHollow | RunGameStateSilk;

export function getGameStateMeta(game: GameId, run: RunGameStateUnmapped): RunGameStateMeta {
	const base: RunGameStateBase = {
		gameVersion: run.gameVersion,

		// -- shared --
		// time
		playTime: run.playTime,
		startedAt: run.startedAt,
		endedAt: run.endedAt,

		// bools
		unlockedCompletionRate: run.unlockedCompletionRate,

		// ints
		completionPercentage: run.completionPercentage,
		maxHealth: run.maxHealth,
		geo: run.geo,
		permadeathMode: run.permadeathMode,

		// strings
		lastScene: run.lastScene,
	};

	if (game === 'hollow') {
		return {
			...base,
			game: 'hollow',
			// -- game specific --
			mapZone: run.mapZone as MapZoneHollow | null,

			// bools
			killedHollowKnight: run.gsBool1 ?? false,
			killedFinalBoss: run.gsBool2 ?? false,
			killedVoidIdol: run.gsBool3 ?? false,
			dreamNailUpgraded: run.gsBool4 ?? false,

			// ints
			dreamOrbs: run.gsInt1 ?? 0,
			mpReserveMax: run.gsInt2 ?? 0,
		};
	} else if (game === 'silk') {
		return {
			...base,
			game: 'silk',
			// -- game specific --
			mapZone: run.mapZone as MapZoneSilk | null,

			// bools
			endingAct2Regular: run.gsBool1 ?? false,
			endingAct2Cursed: run.gsBool2 ?? false,
			endingAct2SoulSnare: run.gsBool3 ?? false,
			endingAct3: run.gsBool4 ?? false,
			isAct3: run.gsBool5 ?? false,

			// ints
			shellShards: run.gsInt1 ?? 0,
			silkSpoolParts: run.gsInt2 ?? 0,
			extraRestZones: run.gsInt3 ?? ExtraRestZonesSilk.byName.None,
			belltownHouseColour: run.gsInt4 ?? BellhomePaintColoursSilk.byName.None,

			// strings
			currentCrestId: run.gsString1 ?? null,
		};
	}
	return assertNever(game);
}
