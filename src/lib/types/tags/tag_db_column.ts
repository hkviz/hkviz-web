import { GameId } from '../game-ids';
import { TagCode, tags } from './tags';

export const tagDBNames = [
	'tag_first_playthrough',
	'tag_casual',
	'tag_randomizer',
	'tag_item_sync',
	'tag_tas',
	'tag_speedrun_any',
	'tag_speedrun_all_skills',
	'tag_speedrun_112',
	'tag_speedrun_106',
	'tag_speedrun_true',
	'tag_speedrun_godhome',
	'tag_speedrun_low',
	'tag_speedrun_low_true',
	'tag_speedrun_low_godhome',
	'tag_speedrun_grub',
	'tag_speedrun_great_hopper',
	'tag_speedrun_eat_me_too',
	'tag_speedrun_other',
] as const;

export type TagDBColumn = (typeof tagDBNames)[number];

const tagToDBColumn: Record<TagCode, TagDBColumn> = {
	// shared
	first_playthrough: 'tag_first_playthrough',
	casual: 'tag_casual',
	randomizer: 'tag_randomizer',
	item_sync: 'tag_item_sync',
	tas: 'tag_tas',

	// hollow
	speedrun_any: 'tag_speedrun_any',
	speedrun_all_skills: 'tag_speedrun_all_skills',
	speedrun_112: 'tag_speedrun_112',
	speedrun_107: 'tag_speedrun_great_hopper',
	speedrun_106: 'tag_speedrun_106',
	speedrun_true: 'tag_speedrun_true',
	speedrun_godhome: 'tag_speedrun_godhome',
	speedrun_low: 'tag_speedrun_low',
	speedrun_low_true: 'tag_speedrun_low_true',
	speedrun_low_godhome: 'tag_speedrun_low_godhome',
	speedrun_grub: 'tag_speedrun_grub',
	speedrun_eat_me_too: 'tag_speedrun_eat_me_too',
	speedrun_other: 'tag_speedrun_other',

	// silk
	silk_speedrun_any: 'tag_speedrun_any',
	silk_speedrun_true: 'tag_speedrun_true',
	silk_speedrun_100: 'tag_speedrun_112',
	silk_speedrun_act1: 'tag_speedrun_106',
	silk_speedrun_ab: 'tag_speedrun_great_hopper',
	silk_speedrun_low: 'tag_speedrun_low',
	silk_speedrun_other: 'tag_speedrun_other',
};

export function getTagDBColumn(tag: TagCode): TagDBColumn {
	return tagToDBColumn[tag];
}

function makeGameDBColumnToCodeMap(gameId: GameId): Partial<Record<TagDBColumn, TagCode>> {
	return Object.fromEntries(
		tags.filter((tag) => tag.games.includes(gameId)).map((tag) => [getTagDBColumn(tag.code), tag.code]),
	);
}

export const gameDBColumnToTagCodeMap: Record<GameId, Partial<Record<TagDBColumn, TagCode>>> = {
	silk: makeGameDBColumnToCodeMap('silk'),
	hollow: makeGameDBColumnToCodeMap('hollow'),
};

export function getTagCodeFromDBColumn(gameId: GameId, column: TagDBColumn): TagCode | undefined {
	return gameDBColumnToTagCodeMap[gameId][column];
}
