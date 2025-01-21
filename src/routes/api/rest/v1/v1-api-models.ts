import * as v from 'valibot';

const parseDateSchema = v.pipe(
	v.union([v.string(), v.date()]),
	v.transform((value) => {
		if (typeof value === 'string') {
			return new Date(value);
		}
		return value;
	}),
);

const visibilityV1Schema = v.picklist(['public', 'unlisted', 'private']);

export const mapZoneV1Schema = v.picklist([
	'NONE',
	'TEST_AREA',
	'KINGS_PASS',
	'CLIFFS',
	'TOWN',
	'CROSSROADS',
	'GREEN_PATH',
	'ROYAL_GARDENS',
	'FOG_CANYON',
	'WASTES',
	'DEEPNEST',
	'HIVE',
	'BONE_FOREST',
	'PALACE_GROUNDS',
	'MINES',
	'RESTING_GROUNDS',
	'CITY',
	'DREAM_WORLD',
	'COLOSSEUM',
	'ABYSS',
	'ROYAL_QUARTER',
	'WHITE_PALACE',
	'SHAMAN_TEMPLE',
	'WATERWAYS',
	'QUEENS_STATION',
	'OUTSKIRTS',
	'KINGS_STATION',
	'MAGE_TOWER',
	'TRAM_UPPER',
	'TRAM_LOWER',
	'FINAL_BOSS',
	'SOUL_SOCIETY',
	'ACID_LAKE',
	'NOEYES_TEMPLE',
	'MONOMON_ARCHIVE',
	'MANTIS_VILLAGE',
	'RUINED_TRAMWAY',
	'DISTANT_VILLAGE',
	'ABYSS_DEEP',
	'ISMAS_GROVE',
	'WYRMSKIN',
	'LURIENS_TOWER',
	'LOVE_TOWER',
	'GLADE',
	'BLUE_LAKE',
	'PEAK',
	'JONI_GRAVE',
	'OVERGROWN_MOUND',
	'CRYSTAL_MOUND',
	'BEASTS_DEN',
	'GODS_GLORY',
	'GODSEEKER_WASTE',
]);

const tagCodeV1Schema = v.picklist([
	'first_playthrough',
	'casual',
	'randomizer',
	'item_sync',
	'tas',
	'speedrun_any',
	'speedrun_112',
	'speedrun_true',
	'speedrun_106',
	'speedrun_godhome',
	'speedrun_low',
	'speedrun_low_true',
	'speedrun_low_godhome',
	'speedrun_all_skills',
	'speedrun_grub',
	'speedrun_great_hopper',
	'speedrun_eat_me_too',
	'speedrun_other',
]);

const tagGroupV1Schema = v.picklist(['speedrun']);

export const runFileV1Schema = v.object({
	id: v.string(),
	version: v.number(),
	createdAt: parseDateSchema,
	signedUrl: v.string(),
	combinedPartNumber: v.number(),
});

export const userV1Schema = v.object({
	id: v.pipe(v.string(), v.uuid()),
	name: v.string(),
});

export const runDataGameStateV1Schema = v.object({
	hkVersion: v.nullish(v.string()),
	playTime: v.nullish(v.number()),
	maxHealth: v.nullish(v.number()),
	mpReserveMax: v.nullish(v.number()),
	geo: v.nullish(v.number()),
	dreamOrbs: v.nullish(v.number()),
	permadeathMode: v.nullish(v.number()),
	mapZone: v.nullish(mapZoneV1Schema),
	killedHollowKnight: v.nullish(v.boolean()),
	killedFinalBoss: v.nullish(v.boolean()),
	killedVoidIdol: v.nullish(v.boolean()),
	completionPercentage: v.nullish(v.number()),
	unlockedCompletionRate: v.nullish(v.boolean()),
	dreamNailUpgraded: v.nullish(v.boolean()),
	lastScene: v.nullish(v.string()),
	startedAt: v.nullish(parseDateSchema),
	endedAt: v.nullish(parseDateSchema),
});

export const runDataV1Schema = v.object({
	id: v.string(),
	title: v.nullish(v.string()),
	description: v.nullish(v.string()),
	createdAt: parseDateSchema,
	visibility: visibilityV1Schema,
	tags: v.array(tagCodeV1Schema),
	user: userV1Schema,
	startedAt: parseDateSchema,
	lastPlayedAt: v.nullish(parseDateSchema),
	isSteelSoul: v.boolean(),
	isBrokenSteelSoul: v.boolean(),
	archived: v.boolean(),
	isCombinedRun: v.boolean(),
	gameState: runDataGameStateV1Schema,
	files: v.nullish(v.array(runFileV1Schema)),
});

export const runSortV1Schema = v.picklist(['favorites', 'newest']);

export const runFilterV1Schema = v.object({
	userId: v.nullish(v.string()),
	tag: v.nullish(v.union([tagCodeV1Schema, tagGroupV1Schema])),
	sort: v.nullish(runSortV1Schema),
});

export type RunDataV1 = v.InferInput<typeof runDataV1Schema>;
export type RunDataGameStateV1 = v.InferInput<typeof runDataGameStateV1Schema>;
export type RunFileV1 = v.InferInput<typeof runFileV1Schema>;
export type UserV1 = v.InferInput<typeof userV1Schema>;
export type RunFilterV1 = v.InferInput<typeof runFilterV1Schema>;
export type RunSortV1 = v.InferInput<typeof runSortV1Schema>;
export type TagCodeV1 = v.InferInput<typeof tagCodeV1Schema>;
export type TagGroupV1 = v.InferInput<typeof tagGroupV1Schema>;
export type MapZoneV1 = v.InferInput<typeof mapZoneV1Schema>;
export type VisibilityV1 = v.InferInput<typeof visibilityV1Schema>;
