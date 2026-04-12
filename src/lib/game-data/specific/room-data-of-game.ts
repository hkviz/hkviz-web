import { RoomDataHollow } from '~/lib/parser';
import { GameId } from '~/lib/types/game-ids';
import { RoomDataSilk } from '../silk-data/map-data-silk.types';

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
