import * as v from 'valibot';
import { assertNever } from '../parser';

export const GAME_ID_HOLLOWKNIGHT = 'hollow';
export const GAME_ID_SILKSONG = 'silk';

export const gameIds = [GAME_ID_HOLLOWKNIGHT, GAME_ID_SILKSONG] as const;
export type GameId = (typeof gameIds)[number];

export const gameIdSchema = v.picklist(gameIds);
export const gameIdSchemaHollowDefault = v.nullish(gameIdSchema, GAME_ID_HOLLOWKNIGHT);

export function getGameName(gameId: GameId) {
	switch (gameId) {
		case GAME_ID_HOLLOWKNIGHT:
			return 'Hollow Knight';
		case GAME_ID_SILKSONG:
			return 'Silksong';
		default:
			return assertNever(gameId);
	}
}
