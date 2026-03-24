import * as d3 from 'd3';
import { createUniqueId, For } from 'solid-js';
import { silkMapData } from '~/lib/game-data/silk-data/silk-map';
import { SilkMapRoomData } from '~/lib/game-data/silk-data/silk-map.types';
import { type RoomInfo } from '../../parser';
import { useSpriteSheetStore } from '../spritesheets/spritesheet-store';
import { hkMapRoomRectClass } from '../store';

function SilkMapRoom(props: { room: SilkMapRoomData; parentId: string }) {
	const spriteSheetStore = useSpriteSheetStore();
	const mapSheetData = spriteSheetStore.silkMapSheetData;

	function fill() {
		const origColor = props.room.origColor;
		if (!origColor) {
			return 'red';
		}
		return d3.rgb(origColor.x * 255, origColor.y * 255, origColor.z * 255).formatHex();
	}

	const maskId = () =>
		`mask-${props.parentId}-${props.room.mapZone}-${props.room.gameObjectName}`.replace(/\s/g, '-');

	return (
		<g data-scene-name={props.room.sceneName} data-game-object-name={props.room.gameObjectName}>
			<rect
				class={hkMapRoomRectClass(props.room)}
				mask={`url(#${maskId()})`}
				x={props.room.visualBounds?.min.x}
				y={props.room.visualBounds?.min.y}
				width={props.room.visualBounds?.size.x}
				height={props.room.visualBounds?.size.y}
				style={{
					transition: 'fill 0.1s ease 0s',
					fill: fill(),
					opacity: '100%',
				}}
			/>
			<mask id={maskId()}>
				<rect style={{ fill: 'black' }} />
				<For each={props.room.allSprites}>
					{(sprite) => {
						const imgPath = sprite.sprite.name;
						const href = () => mapSheetData()?.[imgPath];

						if (sprite.type === 'initial' && props.room.initialState === 'Rough') {
							return null;
						}

						return (
							<image
								preserveAspectRatio="none"
								data-type={sprite.type}
								data-sprite-name={sprite.sprite.name}
								x={sprite.sprite.bounds.min.x}
								y={sprite.sprite.bounds.min.y}
								width={sprite.sprite.bounds.size.x}
								height={sprite.sprite.bounds.size.y}
								href={href()}
								style={{
									transition: 'opacity 0.1s ease 0s',
									opacity: '100%',
								}}
							/>
						);
					}}
				</For>
			</mask>
		</g>
	);
}

export interface SilkMapRoomsProps {
	onClick?: (event: MouseEvent, r: RoomInfo) => void;
	onMouseOver?: (event: MouseEvent, r: RoomInfo) => void;
	onMouseOut?: (event: MouseEvent, r: RoomInfo) => void;
	alwaysUseAreaAsColor?: boolean;
	highlightSelectedRoom?: boolean;
	alwaysShowMainRoom?: boolean;
}

export function SilkMapRooms() {
	const id = createUniqueId();
	return (
		<g>
			<For each={silkMapData.rooms}>{(room) => <SilkMapRoom room={room} parentId={id} />}</For>
		</g>
	);
}
