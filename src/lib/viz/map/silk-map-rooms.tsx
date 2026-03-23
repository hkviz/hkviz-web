import * as d3 from 'd3';
import { For } from 'solid-js';
import { silkMapData } from '~/lib/silk-data/silk-map';
import { SilkMapRoomData } from '~/lib/silk-data/silk-map.types';
import { type RoomInfo } from '../../parser';
import { hkMapRoomRectClass } from '../store';

function SilkMapRoom(props: { room: SilkMapRoomData }) {
	function fill() {
		const origColor = props.room.origColor;
		if (!origColor) {
			return 'red';
		}
		return d3.rgb(origColor.x * 255, origColor.y * 255, origColor.z * 255).formatHex();
	}

	return (
		<g data-scene-name={props.room.sceneName} data-game-object-name={props.room.gameObjectName}>
			<rect
				class={hkMapRoomRectClass(props.room)}
				x={props.room.visualBounds?.min.x}
				y={props.room.visualBounds?.min.y}
				width={props.room.visualBounds?.size.x}
				height={props.room.visualBounds?.size.y}
				style={{
					transition: 'fill 0.1s ease 0s',
					fill: fill(),
				}}
			/>
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
	return (
		<g>
			<For each={silkMapData.rooms}>{(room) => <SilkMapRoom room={room} />}</For>
		</g>
	);
}
