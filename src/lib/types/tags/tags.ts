import * as v from 'valibot';
import { cn } from '../../utils';
import { GameId } from '../game-ids';

interface TagColor {
	className: string;
}

const tagClasses = cn(
	'relative rounded-full border-0 px-2.5 py-0.75 font-semibold tracking-wide text-white ring-[1.5px] ring-inset',
	'duration-200 hover:brightness-110',
);

const lime: TagColor = {
	className: cn(tagClasses, 'bg-gradient-to-b from-lime-600 via-lime-700 to-lime-800 ring-lime-300/10'),
};

const green: TagColor = {
	className: cn(tagClasses, 'bg-gradient-to-b from-green-600 via-green-700 to-green-800 ring-green-300/10'),
};

const violet: TagColor = {
	className: cn(tagClasses, 'bg-gradient-to-b from-violet-600 via-violet-700 to-violet-800 ring-violet-300/10'),
};

const red: TagColor = {
	className: cn(tagClasses, 'bg-gradient-to-b from-red-600 via-red-700 to-red-800 ring-red-300/10'),
};

const orange: TagColor = {
	className: cn(tagClasses, 'bg-gradient-to-b from-orange-600 via-orange-700 to-orange-800 ring-orange-300/10'),
};

const amber: TagColor = {
	className: cn(tagClasses, 'bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800 ring-amber-300/10'),
};

const fuchsia: TagColor = {
	className: cn(tagClasses, 'bg-gradient-to-b from-fuchsia-600 via-fuchsia-700 to-fuchsia-800 ring-fuchsia-300/10'),
};

const indigo: TagColor = {
	className: cn(tagClasses, 'bg-gradient-to-b from-indigo-600 via-indigo-700 to-indigo-800 ring-indigo-300/10'),
};

let _currentNextOrder = 1;
function nextOrder() {
	return _currentNextOrder++;
}

export type TagGroupCode = 'hollow_speedrun' | 'silk_speedrun';

function makeTag<TId extends string>(options: {
	code: TId;
	name: string;
	longName?: string;
	color: { className: string };
	group?: TagGroupCode;
	games?: GameId[];

	removed?: true;
}) {
	return {
		...options,
		order: nextOrder(),
		games: options.games ?? ['hollow', 'silk'],
	} as const;
}

export const tags = [
	makeTag({
		code: 'first_playthrough',
		name: 'First Playthrough',
		color: green,
	}),
	makeTag({
		code: 'casual',
		name: 'Casual',
		color: lime,
	}),
	makeTag({
		code: 'randomizer',
		name: 'Randomizer',
		color: fuchsia,
	}),
	makeTag({
		code: 'item_sync',
		name: 'ItemSync',
		color: violet,
	}),
	makeTag({
		code: 'tas',
		name: 'TAS',
		color: indigo,
	}),

	// Hollow Knight
	// originally from https://hollow-knight-speedrunning.fandom.com/wiki/Speedrun_categories
	// now match https://www.speedrun.com/hollowknight categories
	makeTag({
		code: 'speedrun_any',
		name: 'Any%',
		group: 'hollow_speedrun',
		color: red,
		games: ['hollow'],
	}),
	makeTag({
		code: 'speedrun_all_skills',
		name: 'All Skills',
		group: 'hollow_speedrun',
		color: orange,
		games: ['hollow'],
	}),
	makeTag({
		code: 'speedrun_112',
		name: '112% APB',
		longName: '112% All Pantheon Bosses',
		group: 'hollow_speedrun',
		color: orange,
		games: ['hollow'],
	}),
	makeTag({
		code: 'speedrun_107',
		name: '107% AB',
		longName: '107% All Bosses',
		group: 'hollow_speedrun',
		color: orange,
		games: ['hollow'],
	}),
	makeTag({
		code: 'speedrun_106',
		name: '106% True Ending',
		group: 'hollow_speedrun',
		color: orange,
		games: ['hollow'],
	}),
	makeTag({
		code: 'speedrun_true',
		name: 'True Ending',
		group: 'hollow_speedrun',
		color: orange,
		games: ['hollow'],
	}),
	makeTag({
		code: 'speedrun_godhome',
		name: 'Godhome Ending',
		group: 'hollow_speedrun',
		color: orange,
		removed: true,
		games: ['hollow'],
	}),
	makeTag({
		code: 'speedrun_low',
		name: 'Low%',
		group: 'hollow_speedrun',
		color: amber,
		games: ['hollow'],
	}),
	makeTag({
		code: 'speedrun_low_true',
		name: 'Low% True Ending',
		group: 'hollow_speedrun',
		color: amber,
		games: ['hollow'],
	}),
	makeTag({
		code: 'speedrun_low_godhome',
		name: 'Low% Godhome Ending',
		group: 'hollow_speedrun',
		color: amber,
		games: ['hollow'],
	}),
	makeTag({
		code: 'speedrun_grub',
		name: 'Grub%',
		group: 'hollow_speedrun',
		color: orange,
		removed: true,
		games: ['hollow'],
	}),
	// actually removed - tag column reused for speedrun 107 all bosses
	// makeTag({
	// 	code: 'speedrun_great_hopper',
	// 	name: 'Great Hopper%',
	// 	group: 'speedrun',
	// 	color: orange,
	// 	removed: true,
	// 	games: ['hollow'],
	// }),
	makeTag({
		code: 'speedrun_eat_me_too',
		name: 'Eat Me Too%',
		group: 'hollow_speedrun',
		color: orange,
		removed: true,
		games: ['hollow'],
	}),
	makeTag({
		code: 'speedrun_other',
		name: 'Other Speedrun',
		group: 'hollow_speedrun',
		color: red,
		games: ['hollow'],
	}),

	// Silksong
	makeTag({
		code: 'silk_speedrun_any',
		name: 'Any%',
		group: 'silk_speedrun',
		color: red,
		games: ['silk'],
	}),
	makeTag({
		code: 'silk_speedrun_true',
		name: 'True Ending',
		group: 'silk_speedrun',
		color: orange,
		games: ['silk'],
	}),
	makeTag({
		code: 'silk_speedrun_100',
		name: '100%',
		group: 'silk_speedrun',
		color: orange,
		games: ['silk'],
	}),
	makeTag({
		code: 'silk_speedrun_act1',
		name: 'Act 1',
		group: 'silk_speedrun',
		color: orange,
		games: ['silk'],
	}),
	makeTag({
		code: 'silk_speedrun_ab',
		name: '107% AB',
		longName: 'All Bosses',
		group: 'silk_speedrun',
		color: orange,
		games: ['silk'],
	}),
	makeTag({
		code: 'silk_speedrun_low',
		name: 'Low%',
		group: 'silk_speedrun',
		color: amber,
		games: ['silk'],
	}),
	makeTag({
		code: 'silk_speedrun_other',
		name: 'Other Speedrun',
		group: 'silk_speedrun',
		color: red,
		games: ['silk'],
	}),
] as const;

function tagsOfGroup(group: TagGroupCode | undefined) {
	return tags.filter((it) => ('group' in it ? it.group : undefined) === group);
}

export const tagGroups = [
	{
		code: 'hollow_speedrun',
		name: 'Hollow Knight Speedrun',
		tags: tagsOfGroup('hollow_speedrun'),
		tagsNotRemoved: tagsOfGroup('hollow_speedrun').filter((tag) => !tag.removed),
	},
	{
		code: 'silk_speedrun',
		name: 'Silksong Speedrun',
		tags: tagsOfGroup('silk_speedrun'),
		tagsNotRemoved: tagsOfGroup('silk_speedrun').filter((tag) => !tag.removed),
	},
] as const;

export const ungroupedTagsNotRemoved = tagsOfGroup(undefined).filter((tag) => !tag.removed);

type CodesOf<T extends readonly { code: unknown }[]> = {
	[I in keyof T]: T[I]['code'];
};

type TagGroupCodes = CodesOf<typeof tagGroups>;
export type TagGroup = (typeof tagGroups)[number];
export const tagGroupCodes = tagGroups.map((it) => it.code) as unknown as TagGroupCodes;
export const tagGroupSchema = v.picklist(tagGroupCodes);

type TagCodes = CodesOf<typeof tags>;
export type Tag = (typeof tags)[number];
export type TagCode = TagCodes[number];
export const tagCodes = tags.map((it) => it.code) as unknown as TagCodes;
export const tagSchema = v.picklist(tagCodes);

export const tagCodesByGame: Record<GameId, TagCode[]> = {
	hollow: tags.filter((tag) => tag.games.includes('hollow')).map((tag) => tag.code),
	silk: tags.filter((tag) => tag.games.includes('silk')).map((tag) => tag.code),
};

export const tagCodeSchemaByGame = {
	hollow: v.picklist(tagCodesByGame.hollow),
	silk: v.picklist(tagCodesByGame.silk),
};

export const tagCodeWithGameSchema = v.variant('game', [
	v.object({
		game: v.literal('hollow'),
		code: tagCodeSchemaByGame.hollow,
	}),
	v.object({
		game: v.literal('silk'),
		code: tagCodeSchemaByGame.silk,
	}),
]);

export function tagFromCode(code: TagCode): Tag {
	return tags.find((it) => it.code === code)!;
}

export function tagGroupFromCode(code: TagGroupCode): TagGroup {
	return tagGroups.find((it) => it.code === code)!;
}

export function isGroupCode(code: TagCode | TagGroupCode): code is TagGroupCode {
	return tagGroupCodes.includes(code as TagGroupCode);
}

export function isTagCode(code: TagCode | TagGroupCode): code is TagCode {
	return tagCodes.includes(code as TagCode);
}

export function tagOrGroupFromCode(code: TagCode | TagGroupCode): Tag | TagGroup {
	return tagFromCode(code as TagCode) ?? tagGroupFromCode(code as TagGroupCode);
}

export function isTagGroup(tagOrGroup: Tag | TagGroup): tagOrGroup is TagGroup {
	return 'tags' in tagOrGroup;
}

export function isTag(tagOrGroup: Tag | TagGroup): tagOrGroup is Tag {
	return !isTagGroup(tagOrGroup);
}
