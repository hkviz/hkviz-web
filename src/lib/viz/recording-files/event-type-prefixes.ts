export const PARTIAL_EVENT_PREFIXES = {
    // must not be the start of another prefix
    PLAYER_DATA_SHORTNAME: '$',
    PLAYER_DATA_LONGNAME: '§',

    HERO_CONTROLLER_STATE_SHORTNAME: '%',
    HERO_CONTROLER_STATE_LONGNAME: '&',
} as const;

export type PartialEventPrefix = (typeof PARTIAL_EVENT_PREFIXES)[keyof typeof PARTIAL_EVENT_PREFIXES];

export const EVENT_PREFIXES = {
    // safe to have other prefixes with same start
    PLAYER_POSITION: '', // no prefix = position
    ROOM_DIMENSIONS: 'S',
    SCENE_CHANGE: 's',
    HZVIZ_MOD_VERSION: 'vizmodv',
    HOLLOWKNIGHT_VERSION: 'hkv',
    RECORDING_FILE_VERSION: 'rfv',
    RECORDING_ID: 'rid',
    SESSION_END: 'send',

    SPELL_FIREBALL: 'sfb',
    SPELL_UP: 'sup',
    SPELL_DOWN: 'sdn',

    NAIL_ART_CYCLONE: 'nac',
    NAIL_ART_D_SLASH: 'nad',
    NAIL_ART_G_SLASH: 'nag',

    SUPER_DASH: 'sd',
} as const;

export type EventPrefix = (typeof EVENT_PREFIXES)[keyof typeof EVENT_PREFIXES];
