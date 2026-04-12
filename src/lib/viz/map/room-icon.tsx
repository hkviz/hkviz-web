import { createMemo } from 'solid-js';
import { Bounds } from '~/lib/game-data/shared/bounds';
import { Vector2 } from '~/lib/game-data/shared/vectors';
import { RoomDataOfGame } from '~/lib/game-data/specific/room-data-of-game';
import { GameId } from '~/lib/types/game-ids';
import { cn } from '~/lib/utils';
import { HkMapRooms } from './hollow-map-rooms';

export interface HKMapRoomProps<Game extends GameId> {
	class?: string;
	roomInfos: RoomDataOfGame<Game>[];
}

export function HKMapRoom<Game extends GameId>(props: HKMapRoomProps<Game>) {
	const roomInfosOfRoom = createMemo(() => {
		const visualBoundsAllSprites = props.roomInfos.map((it) => it.visualBoundsAllSprites).filter((it) => !!it);
		const containingBounds =
			visualBoundsAllSprites.length === 0 ? Bounds.ZERO : Bounds.fromContainingBounds(visualBoundsAllSprites);
		const smallerRoomSizeProportion = containingBounds.size.minElement() / containingBounds.size.maxElement();
		const roomPositionWithin0To1 =
			containingBounds.size.x > containingBounds.size.y
				? Bounds.fromMinSize(
						new Vector2(0, (1 - smallerRoomSizeProportion) / 2),
						new Vector2(1, smallerRoomSizeProportion),
					)
				: Bounds.fromMinSize(
						new Vector2((1 - smallerRoomSizeProportion) / 2, 0),
						new Vector2(smallerRoomSizeProportion, 1),
					);

		function relativeToRoomBounds(spritePosition: Bounds) {
			const x = Bounds.fromMinSize(
				new Vector2(
					((spritePosition.min.x - containingBounds.min.x) / containingBounds.size.x) *
						roomPositionWithin0To1.size.x +
						roomPositionWithin0To1.min.x,
					((spritePosition.min.y - containingBounds.min.y) / containingBounds.size.y) *
						roomPositionWithin0To1.size.y +
						roomPositionWithin0To1.min.y,
				),
				new Vector2(
					(spritePosition.size.x / containingBounds.size.x) * roomPositionWithin0To1.size.x,
					(spritePosition.size.y / containingBounds.size.y) * roomPositionWithin0To1.size.y,
				),
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
				<HkMapRooms
					rooms={roomInfosOfRoom()}
					alwaysShowMainRoom={true}
					alwaysUseAreaAsColor={true}
					highlightSelectedRoom={false}
				/>
			</svg>
		</div>
	);
}
