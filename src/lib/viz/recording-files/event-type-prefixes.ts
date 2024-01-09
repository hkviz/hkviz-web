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
    ENTITY_POSITIONS: '', // no prefix = positions
    ROOM_DIMENSIONS: 'S',
    SCENE_CHANGE: 's',
    HZVIZ_MOD_VERSION: 'vizmodv',
    MODDING_INFO: 'mi',
    RECORDING_FILE_VERSION: 'rfv',

    // not logged since 1.0.0 since correct version is logged as part of player data
    // but still here to avoid unknown lines errors for old recordings
    DEPRECATED_HOLLOW_KNIGHT_VERSION: 'hkv',
    RECORDING_ID: 'rid',
    SESSION_END: 'send',

    SPELL_FIREBALL: 'sfb',
    SPELL_UP: 'sup',
    SPELL_DOWN: 'sdn',

    NAIL_ART_CYCLONE: 'nc',
    NAIL_ART_D_SLASH: 'nd',
    NAIL_ART_G_SLASH: 'ng',

    SUPER_DASH: 'sd',

    DREAM_NAIL_SLASH: 'dn',
    DREAM_NAIL_GATE_WARP: 'dnw',
    DREAM_NAIL_SET_GATE: 'dns',

    ENEMY_START: 'e',
    ENEMY_HEALTH: 'E',

    GAME_STATE: 'gs',
    ACTIVE_INPUT_DEVICE: 'aid',
} as const;

export type EventPrefix = (typeof EVENT_PREFIXES)[keyof typeof EVENT_PREFIXES];
