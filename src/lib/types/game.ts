import * as v from 'valibot';

export const gameIds = ['hollow', 'silk'] as const;
export type GameId = (typeof gameIds)[number];

export const gameIdSchema = v.picklist(gameIds);
