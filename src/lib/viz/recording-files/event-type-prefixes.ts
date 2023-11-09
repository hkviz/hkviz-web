
export const EVENT_TYPE_PREFIXES = {
	PLAYER_POSITION: 'P',
	SCENE_CHANGE: 'S',
	ROOM_DIMENSIONS: 'room-dimensions',
} as const;

export type EventTypePrefix = typeof EVENT_TYPE_PREFIXES[keyof typeof EVENT_TYPE_PREFIXES];