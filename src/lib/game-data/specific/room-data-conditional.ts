import type { RoomDataAny } from './room-data-of-game';

export function hasConditional(room: RoomDataAny): boolean {
	const spritesByVariant = room.game === 'hollow' ? room.spritesByVariant : null;
	return spritesByVariant != null && 'conditional' in spritesByVariant && spritesByVariant.conditional != null;
}
