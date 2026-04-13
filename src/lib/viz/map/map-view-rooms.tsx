import { For, createMemo, createUniqueId } from 'solid-js';
import { RoomDataOfGame } from '~/lib/game-data/specific/room-data-of-game';
import { GameId } from '~/lib/types/game-ids';
import { useSpriteSheetStore } from '../spritesheets/spritesheet-store';
import {
	hkMapRoomRectClass,
	useGameplayStore,
	useRoomColoringStore,
	useRoomDisplayStore,
	useThemeStore,
} from '../store';

function MapViewRoom<Game extends GameId>(props: {
	room: RoomDataOfGame<Game>;
	highlightSelectedRoom: boolean;
	alwaysShowMainRoom: boolean;
	alwaysUseAreaAsColor: boolean;
	maskId: string;
}) {
	const roomColoringStore = useRoomColoringStore();
	const spriteSheetStore = useSpriteSheetStore();
	const gameplayStore = useGameplayStore();
	const mapSheetData = () =>
		gameplayStore.game() === 'silk' ? spriteSheetStore.silkMapSheetData() : spriteSheetStore.hollowMapSheetData();

	const roomDisplayStore = useRoomDisplayStore();
	const states = createMemo(() => roomDisplayStore.stateForGameObjectName(props.room.gameObjectName)!);
	const isInteractable = createMemo(
		() => (props.room.isMainGameObject && props.alwaysShowMainRoom) || states().isVisible(),
	);

	return (
		<g data-scene-name={props.room.sceneName} data-game-object-name={props.room.gameObjectName}>
			<mask id={props.maskId}>
				<rect style={{ fill: 'black' }} />
				<For each={props.room.allSprites}>
					{(sprite) => {
						const imgPath =
							'nameWithoutSubSprites' in sprite
								? (sprite.nameWithoutSubSprites ?? sprite.sprite.name)
								: sprite.sprite.name;
						const href = () => mapSheetData()?.[imgPath];

						return (
							<image
								data-variant={sprite.variant}
								preserveAspectRatio="none"
								x={sprite.sprite.visualBounds.min.x}
								y={sprite.sprite.visualBounds.min.y}
								width={sprite.sprite.visualBounds.size.x}
								height={sprite.sprite.visualBounds.size.y}
								// href={'/ingame-map/' + (sprite.nameWithoutSubSprites ?? sprite.name) + '.png'}
								href={href()}
								style={{
									transition: 'opacity 0.1s ease 0s',
									opacity: states().variant() === sprite.variant ? '100%' : '0%',
								}}
							/>
						);
					}}
				</For>
			</mask>
			<rect
				class={hkMapRoomRectClass(props.room)}
				mask={`url(#${props.maskId})`}
				x={props.room.visualBoundsAllSprites?.min.x ?? 0}
				y={props.room.visualBoundsAllSprites?.min.y ?? 0}
				width={props.room.visualBoundsAllSprites?.size.x ?? 0}
				height={props.room.visualBoundsAllSprites?.size.y ?? 0}
				style={{
					transition: 'fill 0.1s ease 0s',
					fill: props.alwaysUseAreaAsColor
						? roomColoringStore.areaColorByGameObjectName().get(props.room.gameObjectName)
						: roomColoringStore.selectedModeColorByGameObjectName().get(props.room.gameObjectName),
					['pointer-events']: isInteractable() ? 'all' : 'none',
				}}
			/>
		</g>
	);
}

export interface MapViewRoomsProps<Game extends GameId> {
	rooms: RoomDataOfGame<Game>[];
	onClick?: (event: MouseEvent, r: RoomDataOfGame<Game>) => void;
	onMouseOver?: (event: MouseEvent, r: RoomDataOfGame<Game>) => void;
	onMouseOut?: (event: MouseEvent, r: RoomDataOfGame<Game>) => void;
	alwaysUseAreaAsColor?: boolean;
	highlightSelectedRoom?: boolean;
	alwaysShowMainRoom?: boolean;
}

export function MapViewRooms<Game extends GameId>(props: MapViewRoomsProps<Game>) {
	const roomDisplayStore = useRoomDisplayStore();
	const themeStore = useThemeStore();
	const idPrefix = createUniqueId();

	const roomByGameObjectName = createMemo(() => new Map(props.rooms.map((room) => [room.gameObjectName, room])));
	const maskIdByGameObjectName = createMemo(
		() =>
			new Map(
				props.rooms.map((room) => {
					const go = room.gameObjectName.replace(/\s/g, '_');
					return [room.gameObjectName, `mask_${idPrefix}_${go}`];
				}),
			),
	);
	const hoveredRooms = createMemo(() => {
		if (!(props.highlightSelectedRoom ?? true)) return [] as RoomDataOfGame<Game>[];
		return props.rooms.filter((room) => roomDisplayStore.stateForGameObjectName(room.gameObjectName)?.isHovered());
	});

	let hoveredGameObjectName: string | null = null;

	function roomFromEventTarget(target: EventTarget | null) {
		if (!(target instanceof Element)) return null;
		const roomElement = target.closest<SVGGElement>('[data-game-object-name]');
		if (!roomElement) return null;
		const gameObjectName = roomElement.dataset.gameObjectName;
		if (!gameObjectName) return null;
		return roomByGameObjectName().get(gameObjectName) ?? null;
	}

	function handleMouseMove(event: MouseEvent) {
		if (event.buttons !== 0) return;

		const hoveredRoom = roomFromEventTarget(event.target);
		const nextGameObjectName = hoveredRoom?.gameObjectName ?? null;
		if (nextGameObjectName === hoveredGameObjectName) return;

		if (hoveredGameObjectName) {
			const previousRoom = roomByGameObjectName().get(hoveredGameObjectName);
			if (previousRoom) {
				props.onMouseOut?.(event, previousRoom);
			}
		}

		if (hoveredRoom) {
			props.onMouseOver?.(event, hoveredRoom);
		}

		hoveredGameObjectName = nextGameObjectName;
	}

	function handleMouseLeave(event: MouseEvent) {
		if (!hoveredGameObjectName) return;
		const previousRoom = roomByGameObjectName().get(hoveredGameObjectName);
		if (previousRoom) {
			props.onMouseOut?.(event, previousRoom);
		}
		hoveredGameObjectName = null;
	}

	function handleClick(event: MouseEvent) {
		const room = roomFromEventTarget(event.target);
		if (!room) return;
		props.onClick?.(event, room);
	}

	return (
		<g onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={handleClick}>
			<For each={props.rooms}>
				{(room) => (
					<MapViewRoom
						room={room}
						highlightSelectedRoom={props.highlightSelectedRoom ?? true}
						alwaysShowMainRoom={props.alwaysShowMainRoom ?? false}
						alwaysUseAreaAsColor={props.alwaysUseAreaAsColor ?? false}
						maskId={maskIdByGameObjectName().get(room.gameObjectName)!}
					/>
				)}
			</For>
			<g
				filter="url(#hover_mask_filter)"
				style={{
					fill: themeStore.currentTheme() === 'dark' ? 'white' : 'black',
					visibility: hoveredRooms().length > 0 ? 'visible' : 'hidden',
				}}
			>
				<For each={hoveredRooms()}>
					{(room) => (
						<rect
							mask={`url(#${maskIdByGameObjectName().get(room.gameObjectName)!})`}
							x={room.visualBoundsAllSprites?.min.x ?? 0}
							y={room.visualBoundsAllSprites?.min.y ?? 0}
							width={room.visualBoundsAllSprites?.size.x ?? 0}
							height={room.visualBoundsAllSprites?.size.y ?? 0}
							style={{ ['pointer-events']: 'none' }}
						/>
					)}
				</For>
			</g>
		</g>
	);
}
