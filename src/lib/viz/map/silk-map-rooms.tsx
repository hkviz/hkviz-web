import * as d3 from 'd3';
import { createUniqueId, For } from 'solid-js';
import { RoomDataHollow } from '~/lib/game-data/hollow-data/map-data-hollow';
import { silkMapData } from '~/lib/game-data/silk-data/map-data-silk';
import { RoomDataSilk } from '~/lib/game-data/silk-data/map-data-silk.types';
import { useSpriteSheetStore } from '../spritesheets/spritesheet-store';
import { hkMapRoomRectClass } from '../store';

function SilkMapRoom(props: { room: RoomDataSilk; parentId: string }) {
	const spriteSheetStore = useSpriteSheetStore();
	const mapSheetData = spriteSheetStore.silkMapSheetData;

	function fill() {
		const origColor = props.room.origColor;
		if (!origColor) {
			return 'red';
		}
		return origColor.formatHex();
	}

	function fillRgb() {
		return d3.rgb(fill());
	}

	function roomMinX() {
		return props.room.visualBounds?.min.x ?? 0;
	}

	function roomMinY() {
		return props.room.visualBounds?.min.y ?? 0;
	}

	const patternId = () =>
		`pattern-${props.parentId}-${props.room.mapZone}-${props.room.gameObjectName}`.replace(/\s/g, '-');
	const filterId = () =>
		`filter-${props.parentId}-${props.room.mapZone}-${props.room.gameObjectName}`.replace(/\s/g, '-');
	const maskId = () =>
		`mask-${props.parentId}-${props.room.mapZone}-${props.room.gameObjectName}`.replace(/\s/g, '-');

	const useOldMaskLogic = false;

	if (useOldMaskLogic) {
		// no need to be reactive, just for debugging (we don't want runtime overhead of Show)
		// eslint-disable-next-line solid/components-return-once
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
									x={sprite.sprite.visualBounds.min.x}
									y={sprite.sprite.visualBounds.min.y}
									width={sprite.sprite.visualBounds.size.x}
									height={sprite.sprite.visualBounds.size.y}
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
	return (
		<g data-scene-name={props.room.sceneName} data-game-object-name={props.room.gameObjectName}>
			<defs>
				<pattern
					id={patternId()}
					patternUnits="userSpaceOnUse"
					x={roomMinX()}
					y={roomMinY()}
					width={props.room.visualBounds?.size.x}
					height={props.room.visualBounds?.size.y}
				>
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
									x={sprite.sprite.visualBounds.min.x - roomMinX()}
									y={sprite.sprite.visualBounds.min.y - roomMinY()}
									width={sprite.sprite.visualBounds.size.x}
									height={sprite.sprite.visualBounds.size.y}
									href={href()}
									style={{
										transition: 'opacity 0.1s ease 0s',
										opacity: '100%',
									}}
								/>
							);
						}}
					</For>
				</pattern>
				<filter id={filterId()} color-interpolation-filters="sRGB">
					<feComponentTransfer>
						<feFuncR type="linear" slope={fillRgb().r / 255} />
						<feFuncG type="linear" slope={fillRgb().g / 255} />
						<feFuncB type="linear" slope={fillRgb().b / 255} />
						<feFuncA type="linear" slope={1} />
					</feComponentTransfer>
				</filter>
			</defs>
			<rect
				class={hkMapRoomRectClass(props.room)}
				x={props.room.visualBounds?.min.x}
				y={props.room.visualBounds?.min.y}
				width={props.room.visualBounds?.size.x}
				height={props.room.visualBounds?.size.y}
				style={{
					transition: 'fill 0.1s ease 0s',
					fill: `url(#${patternId()})`,
					filter: `url(#${filterId()})`,
					opacity: '100%',
				}}
			/>
		</g>
	);
}

export interface SilkMapRoomsProps {
	onClick?: (event: MouseEvent, r: RoomDataHollow) => void;
	onMouseOver?: (event: MouseEvent, r: RoomDataHollow) => void;
	onMouseOut?: (event: MouseEvent, r: RoomDataHollow) => void;
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
