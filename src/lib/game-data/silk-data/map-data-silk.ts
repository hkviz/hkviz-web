import * as d3 from 'd3';
import { Bounds } from '../shared/bounds.js';
import { colorFromRgbVector } from '../shared/colors.js';
import { SpriteInfoGenerated } from '../shared/sprite-info-generated.js';
import { spriteInfoBounds } from '../shared/sprite-info-mapper.js';
import { silkMapDataGenerated } from './map-data-silk.generated.js';
import { SilkTextDataGenerated } from './map-data-silk.generated.types.js';
import {
	MapDataSilk,
	RoomDataSilk,
	SilkSpriteInfo,
	SomeSpriteTypeSilk,
	SpriteConditionDataSilk,
	TextDataSilk,
} from './map-data-silk.types.js';
import { formatAreaNameSilk } from './room-name-formatting-silk.js';
import { silkScaleBounds } from './silk-scaling.js';

function mapGeneratedText(text: SilkTextDataGenerated): TextDataSilk {
	return {
		...text,
		bounds: silkScaleBounds(text.bounds),
		origColor: d3.hsl(colorFromRgbVector(text.origColor)),
	};
}

function mapSpriteInfo(roomBounds: Bounds | null, sprite: SpriteInfoGenerated): SilkSpriteInfo {
	if (!roomBounds) {
		throw new Error('Sprite info requires room bounds to calculate visual bounds');
	}
	const bounds = spriteInfoBounds(roomBounds, sprite);
	return {
		...sprite,
		visualBounds: bounds,
	};
}

// -- fallback for scenes without sprites --
const origColorByZone = new Map<string, d3.HSLColor>();
silkMapDataGenerated.rooms.forEach((room) => {
	if (room.origColor) {
		const zoneName = room.mapZone;
		if (!origColorByZone.has(zoneName)) {
			origColorByZone.set(zoneName, d3.hsl(colorFromRgbVector(room.origColor)));
		}
	}
});

export const silkMapData: MapDataSilk = {
	rooms: silkMapDataGenerated.rooms.map((room) => {
		const visualBounds = room.visualBounds ? silkScaleBounds(room.visualBounds) : null;

		const altFullSprites: SpriteConditionDataSilk[] | null =
			room.altFullSprites?.map((s, index) => ({
				type: 'alt-full-sprite',
				sprite: mapSpriteInfo(visualBounds, s.sprite),
				condition: s.condition,
				variant: `alt-full-sprite-${index}`,
			})) ?? null;

		const initialSprite = room.initialSprite ? mapSpriteInfo(visualBounds, room.initialSprite) : null;
		const fullSprite = room.fullSprite ? mapSpriteInfo(visualBounds, room.fullSprite) : null;

		const allSpritesUnfiltered: (SomeSpriteTypeSilk | null)[] = [
			initialSprite ? { type: 'initial', sprite: initialSprite, variant: 'initial' } : null,
			fullSprite ? { type: 'full', sprite: fullSprite, variant: 'full' } : null,
			...(altFullSprites ?? []),
		];

		const allSprites = allSpritesUnfiltered.filter((s) => s != null);

		const origColor = room.origColor
			? d3.hsl(colorFromRgbVector(room.origColor))
			: (origColorByZone.get(room.mapZone) ?? d3.hsl(0, 0, 1)); // fallback to white if no color info at all

		const spritesByVariant = Object.fromEntries(allSprites.map((s) => [s.variant, s] as const));

		const mappedIfAllMapped = room.mappedParent ? [room.mappedParent] : room.mappedIfAllMapped;

		const spriteBounds = allSprites.map((s) => s.sprite.visualBounds);
		const visualBoundsAllSprites = Bounds.fromContainingBounds(spriteBounds);

		const altColors =
			room.altColors?.map((c) => ({
				color: d3.hsl(colorFromRgbVector(c.color)),
				condition: c.condition,
			})) ?? null;

		const mappedRoom: RoomDataSilk = {
			game: 'silk',
			mapZone: room.mapZone,
			hasSpriteRenderer: room.hasSpriteRenderer,
			sortingOrder: room.sortingOrder,
			positionZ: room.positionZ,
			initialState: room.initialState,
			unmappedNoBounds: room.unmappedNoBounds,
			excludeBounds: room.excludeBounds,
			hideCondition: room.hideCondition,
			sceneName: room.sceneName,
			gameObjectName: room.gameObjectName,

			altColors,
			mappedIfAllMapped,
			visualBounds,
			playerPositionBounds: room.playerPositionBounds ? silkScaleBounds(room.playerPositionBounds) : null,
			texts: room.texts.map(mapGeneratedText),
			allSprites,
			spritesByVariant,
			origColor,
			roomNameFormatted: room.sceneName, // TODO
			roomNameFormattedZoneExclusive: room.sceneName, // TODO
			zoneNameFormatted: formatAreaNameSilk(room.mapZone) + ': ' + room.mapZone, // TODO
			isMainGameObject: false, // set below
			visualBoundsAllSprites,
		};
		return mappedRoom;
	}),
	areaNames: silkMapDataGenerated.areaNames.map(mapGeneratedText),
};

silkMapData.rooms.sort((a, b) => {
	if (a.sortingOrder !== b.sortingOrder) {
		return a.sortingOrder - b.sortingOrder;
	}
	if (a.positionZ !== b.positionZ) {
		return b.positionZ - a.positionZ;
	}
	return 0;
});

// sceneNames with multiple objects on map:
// Dust_09_into_citadel
// Bone_East_07
// Dock_02b_bot

export const mapDataBySceneNameSilk = new Map(silkMapData.rooms.map((it) => [it.sceneName, it]));
export const mapDataAllBySceneNameSilk = Map.groupBy(silkMapData.rooms, (it) => it.sceneName);
export const mapDataByGameObjectNameSilk = new Map(silkMapData.rooms.map((it) => [it.gameObjectName, it]));

mapDataAllBySceneNameSilk.forEach((rooms) => {
	// Not ideal. probably has some logic behind it.
	rooms[0].isMainGameObject = true;
});
