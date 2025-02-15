import * as v from 'valibot';

const lime = {
    className: 'bg-lime-600 dark:bg-lime-700 hover:bg-lime-900',
};

const green = {
    className: 'bg-green-600 dark:bg-green-700 hover:bg-green-900',
};

const violet = {
    className: 'bg-violet-600 dark:bg-violet-700 hover:bg-violet-900',
};

const red = {
    className: 'bg-red-600 dark:bg-red-700 hover:bg-red-900',
};

const orange = {
    className: 'bg-orange-600 dark:bg-orange-700 hover:bg-orange-900',
};

const amber = {
    className: 'bg-amber-600 dark:bg-amber-700 hover:bg-amber-900',
};

const fuchsia = {
    className: 'bg-fuchsia-600 dark:bg-fuchsia-700 hover:bg-fuchsia-900',
};

const indigo = {
    className: 'bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-900',
};

let _currentNextOrder = 1;
function nextOrder() {
    return _currentNextOrder++;
}

export const tags = [
    {
        code: 'first_playthrough',
        name: 'First Playthrough',
        order: nextOrder(),
        color: green,
    },
    {
        code: 'casual',
        name: 'Casual',
        order: nextOrder(),
        color: lime,
    },
    {
        code: 'randomizer',
        name: 'Randomizer',
        order: nextOrder(),
        color: fuchsia,
    },
    {
        code: 'item_sync',
        name: 'ItemSync',
        order: nextOrder(),
        color: violet,
    },
    {
        code: 'tas',
        name: 'TAS',
        order: nextOrder(),
        color: indigo,
    },

    // from https://hollow-knight-speedrunning.fandom.com/wiki/Speedrun_categories
    {
        code: 'speedrun_any',
        name: 'Any%',
        group: 'speedrun',
        order: nextOrder(),
        color: red,
    },
    {
        code: 'speedrun_112',
        name: '112% All Pantheon Bosses',
        group: 'speedrun',
        order: nextOrder(),
        color: red,
    },
    {
        code: 'speedrun_true',
        name: 'True Ending',
        group: 'speedrun',
        order: 7,
        color: red,
    },
    {
        code: 'speedrun_106',
        name: '106% True Ending',
        group: 'speedrun',
        order: nextOrder(),
        color: red,
    },
    {
        code: 'speedrun_godhome',
        name: 'Godhome Ending',
        group: 'speedrun',
        order: nextOrder(),
        color: red,
    },
    {
        code: 'speedrun_low',
        name: 'Low%',
        group: 'speedrun',
        order: nextOrder(),
        color: amber,
    },
    {
        code: 'speedrun_low_true',
        name: 'Low% True Ending',
        group: 'speedrun',
        order: nextOrder(),
        color: amber,
    },
    {
        code: 'speedrun_low_godhome',
        name: 'Low% Godhome Ending',
        group: 'speedrun',
        order: nextOrder(),
        color: amber,
    },
    {
        code: 'speedrun_all_skills',
        name: 'All Skills',
        group: 'speedrun',
        order: nextOrder(),
        color: orange,
    },
    {
        code: 'speedrun_grub',
        name: 'Grub%',
        group: 'speedrun',
        order: nextOrder(),
        color: orange,
    },
    {
        code: 'speedrun_great_hopper',
        name: 'Great Hopper%',
        group: 'speedrun',
        order: nextOrder(),
        color: orange,
    },
    {
        code: 'speedrun_eat_me_too',
        name: 'Eat Me Too%',
        group: 'speedrun',
        order: nextOrder(),
        color: orange,
    },
    {
        code: 'speedrun_other',
        name: 'Other',
        group: 'speedrun',
        order: nextOrder(),
        color: orange,
    },
] as const;

function tagsOfGroup(group: string | undefined) {
    return tags.filter((it) => ('group' in it ? it.group : undefined) === group);
}

export const tagGroups = [
    {
        code: 'speedrun',
        name: 'Speedrun',
        tags: tagsOfGroup('speedrun'),
    },
] as const;

export const ungroupedTags = tagsOfGroup(undefined);

type CodesOf<T extends readonly { code: unknown }[]> = {
    [I in keyof T]: T[I]['code'];
};

type TagGroupCodes = CodesOf<typeof tagGroups>;
export type TagGroup = (typeof tagGroups)[number];
export type TagGroupCode = TagGroupCodes[number];
export const tagGroupCodes = tagGroups.map((it) => it.code) as unknown as TagGroupCodes;
export const tagGroupSchema = v.picklist(tagGroupCodes);

type TagCodes = CodesOf<typeof tags>;
export type Tag = (typeof tags)[number];
export type TagCode = TagCodes[number];
export const tagCodes = tags.map((it) => it.code) as unknown as TagCodes;
export const tagSchema = v.picklist(tagCodes);

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
