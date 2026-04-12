import { RoomDataAny } from './room-data-of-game';

export function hasConditional(room: RoomDataAny): boolean {
	const spritesByVariant = room.spritesByVariant;
	return 'conditional' in spritesByVariant && spritesByVariant.conditional !== undefined;
}
