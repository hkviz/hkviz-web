import type { GameId } from '~/lib/types/game-ids';
import type { RoomDataHollow } from '../hollow-data/map-data-hollow';
import type { RoomDataSilk } from '../silk-data/map-data-silk.types';

export type RoomDataAny = RoomDataHollow | RoomDataSilk;

export type RoomDataOfGame<Game extends GameId> = Game extends 'hollow'
	? RoomDataHollow
	: Game extends 'silk'
		? RoomDataSilk
		: RoomDataAny;

export function isRoomDataHollow(room: RoomDataAny): room is RoomDataHollow {
	return room.game === 'hollow';
}
export function isRoomDataSilk(room: RoomDataAny): room is RoomDataSilk {
	return room.game === 'silk';
}
