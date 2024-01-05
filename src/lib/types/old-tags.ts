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

export const oldTags = [
    {
        code: 'first-playthrough',
        name: 'First Playthrough',
        order: 1,
        color: green,
    },
    {
        code: 'casual',
        name: 'Casual',
        order: 2,
        color: lime,
    },
    {
        code: 'randomizer',
        name: 'Randomizer',
        order: 3,
        color: fuchsia,
    },
    {
        code: 'item-sync',
        name: 'ItemSync',
        order: 4,
        color: violet,
    },

    // from https://hollow-knight-speedrunning.fandom.com/wiki/Speedrun_categories
    {
        code: 'speedrun_any',
        name: 'Any%',
        group: 'speedrun',
        order: 5,
        color: red,
    },
    {
        code: 'speedrun_112',
        name: '112% All Pantheon Bosses',
        group: 'speedrun',
        order: 6,
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
        order: 8,
        color: red,
    },
    {
        code: 'speedrun_godhome',
        name: 'Godhome Ending',
        group: 'speedrun',
        order: 9,
        color: red,
    },
    {
        code: 'speedrun_low',
        name: 'Low%',
        group: 'speedrun',
        order: 10,
        color: amber,
    },
    {
        code: 'speedrun_low_true',
        name: 'Low% True Ending',
        group: 'speedrun',
        order: 11,
        color: amber,
    },
    {
        code: 'speedrun_low_godhome',
        name: 'Low% Godhome Ending',
        group: 'speedrun',
        order: 12,
        color: amber,
    },
    {
        code: 'speedrun_all_skills',
        name: 'All Skills',
        group: 'speedrun',
        order: 13,
        color: orange,
    },
    {
        code: 'speedrun_great_hopper',
        name: 'Great Hopper%',
        group: 'speedrun',
        order: 14,
        color: orange,
    },
    {
        code: 'speedrun_eat_me_too',
        name: 'Eat Me Too%',
        group: 'speedrun',
        order: 15,
        color: orange,
    },
    {
        code: 'speedrun_other',
        name: 'Other',
        group: 'speedrun',
        order: 16,
        color: orange,
    },
] as const;

type CodesOf<T extends readonly { code: unknown }[]> = {
    [I in keyof T]: T[I]['code'];
};

type OldTagCodes = CodesOf<typeof oldTags>;
export type OldTag = (typeof oldTags)[number];
export type OldTagCode = OldTagCodes[number];
export const oldTagCodes = oldTags.map((it) => it.code) as unknown as OldTagCodes;
