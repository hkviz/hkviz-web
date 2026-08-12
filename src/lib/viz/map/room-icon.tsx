import { createMemo } from 'solid-js';
import { Bounds } from '~/lib/game-data/shared/bounds';
import type { RoomDataOfGame } from '~/lib/game-data/specific/room-data-of-game';
import type { GameId } from '~/lib/types/game-ids';
import { cn } from '~/lib/utils';
import { MapViewRooms } from './map-view-rooms';

export interface HKMapRoomProps<Game extends GameId> {
	class?: string;
	roomInfos: RoomDataOfGame<Game>[];
}

export function HKMapRoom<Game extends GameId>(props: HKMapRoomProps<Game>) {
	const roomInfosOfRoom = createMemo(() => {
		const containingBounds =
			Bounds.fromContainingBoundsIgnoreNullOf(props.roomInfos, (r) => r.visualBoundsAllSprites) ?? Bounds.ZERO;
		const smallerRoomSizeProportion =
			Math.min(containingBounds.sizeX, containingBounds.sizeY) /
			Math.max(containingBounds.sizeX, containingBounds.sizeY);
		const roomPositionWithin0To1 =
			containingBounds.sizeX > containingBounds.sizeY
				? Bounds.fromMinXYSizeXY(0, (1 - smallerRoomSizeProportion) / 2, 1, smallerRoomSizeProportion)
				: Bounds.fromMinXYSizeXY((1 - smallerRoomSizeProportion) / 2, 0, smallerRoomSizeProportion, 1);

		function relativeToRoomBounds(spritePosition: Bounds) {
			const x = Bounds.fromMinXYSizeXY(
				/*min*/
				((spritePosition.minX - containingBounds.minX) / containingBounds.sizeX) *
					roomPositionWithin0To1.sizeX +
					roomPositionWithin0To1.minX,
				((spritePosition.minY - containingBounds.minY) / containingBounds.sizeY) *
					roomPositionWithin0To1.sizeY +
					roomPositionWithin0To1.minY,
				/*size*/
				(spritePosition.sizeX / containingBounds.sizeX) * roomPositionWithin0To1.sizeX,
				(spritePosition.sizeY / containingBounds.sizeY) * roomPositionWithin0To1.sizeY,
			);
			return x;
		}

		return props.roomInfos.map((it) => {
			const allSprites = it.allSprites.map((it) => ({
				...it,
				sprite: {
					...it.sprite,
					visualBounds: relativeToRoomBounds(it.sprite.visualBounds),
				},
			}));
			const spritesByVariant = Object.fromEntries(allSprites.map((it) => [it.variant, it]));
			return {
				...it,
				allSprites,

				spritesByVariant: spritesByVariant as any,
				visualBoundsAllSprites: roomPositionWithin0To1,
			};
		});
	});

	return (
		<div class={cn('relative', props.class)}>
			<svg class="absolute inset-0" width="100%" height="100%" viewBox="0 0 1 1">
				<MapViewRooms
					rooms={roomInfosOfRoom()}
					alwaysShowMainRoom={true}
					alwaysUseAreaAsColor={true}
					highlightSelectedRoom={false}
				/>
			</svg>
		</div>
	);
}
