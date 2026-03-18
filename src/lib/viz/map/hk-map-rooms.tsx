import { For, createMemo, createUniqueId } from 'solid-js';
import { type RoomInfo } from '../../parser';
import { useSpriteSheetStore } from '../spritesheets/spritesheet-store';
import { hkMapRoomRectClass, useRoomColoringStore, useRoomDisplayStore, useThemeStore } from '../store';

function HkMapRoom(props: {
	room: RoomInfo;
	highlightSelectedRoom: boolean;
	alwaysShowMainRoom: boolean;
	alwaysUseAreaAsColor: boolean;
	maskId: string;
}) {
	const roomColoringStore = useRoomColoringStore();
	const spriteSheetStore = useSpriteSheetStore();
	const mapSheetData = spriteSheetStore.mapSheetData;

	const roomDisplayStore = useRoomDisplayStore();
	const states = createMemo(() => roomDisplayStore.statesByGameObjectName.get(props.room.gameObjectName)!);
	const isInteractable = createMemo(
		() => (props.room.isMainGameObject && props.alwaysShowMainRoom) || states().isVisible(),
	);

	return (
		<g data-scene-name={props.room.sceneName} data-game-object-name={props.room.gameObjectName}>
			<mask id={props.maskId}>
				<rect style={{ fill: 'black' }} />
				<For each={props.room.sprites}>
					{(sprite) => {
						const imgPath = sprite.nameWithoutSubSprites ?? sprite.name;
						const href = () => mapSheetData()?.[imgPath];

						return (
							<image
								data-variant={sprite.variant}
								preserveAspectRatio="none"
								x={sprite.scaledPosition.min.x}
								y={sprite.scaledPosition.min.y}
								width={sprite.scaledPosition.size.x}
								height={sprite.scaledPosition.size.y}
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
				x={props.room.allSpritesScaledPositionBounds.min.x}
				y={props.room.allSpritesScaledPositionBounds.min.y}
				width={props.room.allSpritesScaledPositionBounds.size.x}
				height={props.room.allSpritesScaledPositionBounds.size.y}
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

export interface HkMapRoomsProps {
	rooms: RoomInfo[];
	onClick?: (event: MouseEvent, r: RoomInfo) => void;
	onMouseOver?: (event: MouseEvent, r: RoomInfo) => void;
	onMouseOut?: (event: MouseEvent, r: RoomInfo) => void;
	alwaysUseAreaAsColor?: boolean;
	highlightSelectedRoom?: boolean;
	alwaysShowMainRoom?: boolean;
}

export function HkMapRooms(props: HkMapRoomsProps) {
	const roomDisplayStore = useRoomDisplayStore();
	const themeStore = useThemeStore();
	const idPrefix = createUniqueId();

	const roomByGameObjectName = createMemo(() => new Map(props.rooms.map((room) => [room.gameObjectName, room])));
	const maskIdByGameObjectName = createMemo(
		() => new Map(props.rooms.map((room) => [room.gameObjectName, `mask_${idPrefix}_${room.gameObjectName}`])),
	);
	const hoveredRooms = createMemo(() => {
		if (!(props.highlightSelectedRoom ?? true)) return [] as RoomInfo[];
		return props.rooms.filter((room) =>
			roomDisplayStore.statesByGameObjectName.get(room.gameObjectName)?.isHovered(),
		);
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
					<HkMapRoom
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
							x={room.allSpritesScaledPositionBounds.min.x}
							y={room.allSpritesScaledPositionBounds.min.y}
							width={room.allSpritesScaledPositionBounds.size.x}
							height={room.allSpritesScaledPositionBounds.size.y}
							style={{ ['pointer-events']: 'none' }}
						/>
					)}
				</For>
			</g>
		</g>
	);
}
