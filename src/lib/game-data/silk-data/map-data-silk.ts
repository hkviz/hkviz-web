import * as d3 from 'd3';
import { Bounds } from '../shared/bounds.js';
import { colorFromRgbVector } from '../shared/colors.js';
import { MapTextData } from '../shared/map-text-data.js';
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
} from './map-data-silk.types.js';
import { GlobalEnums_MapZoneSilk } from './player-data-silk.generated.js';
import { sceneNameGetZone } from './scene-ids-get-zone.js';
import { isActualSceneNameSilk } from './scene-name-check-silk.js';
import { silkScaleBounds } from './silk-scaling.js';

function mapGeneratedText(text: SilkTextDataGenerated): MapTextData {
	const [sheetName, convoName] = text.textKey.split('.');
	return {
		...text,
		sheetName,
		convoName,
		position: null,
		bounds: silkScaleBounds(text.bounds),
		color: d3.hsl(colorFromRgbVector(text.origColor)),
		isSubArea: text.objectPath.includes('Sub'),
		type: text.objectPath.includes('Sub') ? 'sub-area' : 'area',
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

const silkSceneNameToActual: Record<string, string> = {
	Slab_03b: 'Slab_03',
	Cog_07b: 'Cog_07',
	'Library_04 _bot': 'Library_04', // accidental space in game files?
	Arborium_07b: 'Arborium_07',
	Dust_10b: 'Dust_10',
	Enclave_bridge_left: 'Song_Enclave',
	Shellwood_13b: 'Shellwood_13',
};

const silkZoneMappings: Partial<Record<GlobalEnums_MapZoneSilk, GlobalEnums_MapZoneSilk>> = {
	CORAL_CAVERNS: 'RED_CORAL_GORGE',
};

const silkMapRooms = silkMapDataGenerated.rooms.map((room) => {
	const sceneNameForVisited = room.sceneName;
	let sceneName = room.sceneName;

	let isMainGameObject = null;

	if (silkSceneNameToActual[sceneName]) {
		sceneName = silkSceneNameToActual[sceneName];
		isMainGameObject = false;
	} else if (!isActualSceneNameSilk(sceneName)) {
		let attempts = 0;
		let current = sceneName;

		while (attempts < 4) {
			const parts = current.split('_');
			if (parts.length <= 1) break;
			const candidate = parts.slice(0, -1).join('_');
			if (isActualSceneNameSilk(candidate)) {
				sceneName = candidate;
				isMainGameObject = false;
				break;
			}
			current = candidate;
			attempts++;
		}

		if (sceneName === room.sceneName) {
			console.warn(`Scene name ${room.sceneName} is not an actual scene name in silk data`);
		}
	}

	const visualBounds = room.visualBounds ? silkScaleBounds(room.visualBounds) : null;

	// TODO silk: replicate bounds for player position like game does:
	// public Sprite BoundsSprite
	// 	{
	// 		get
	// 		{
	// 			if (unmappedNoBounds && !IsMapped)
	// 			{
	// 				return null;
	// 			}
	// 			if (IsInitialStateRough() && (bool)fullSprite) // initialState == States.Rough;
	// 			{
	// 				return fullSprite;
	// 			}
	// 			if (!hasSpriteRenderer)
	// 			{
	// 				return null;
	// 			}
	// 			return initialSprite;
	// 		}
	// 	}

	const altFullSprites: SpriteConditionDataSilk[] | null =
		room.altFullSprites?.map((s, index) => ({
			type: 'alt-full-sprite',
			sprite: mapSpriteInfo(visualBounds, s.sprite),
			condition: s.condition,
			variant: `alt-full-sprite-${index}`,
		})) ?? null;

	const initialSprite = room.initialSprite ? mapSpriteInfo(visualBounds, room.initialSprite) : null;
	let fullSprite = room.fullSprite ? mapSpriteInfo(visualBounds, room.fullSprite) : null;

	if (room.initialState !== 'Rough' && fullSprite) {
		// game never uses this sprite. some rooms have set a full sprite (because of copy-pasting in the editor likely).
		// our variant selector would never select it, but the bounds would still include it.
		fullSprite = null;
	}

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

	let mapZone = sceneNameGetZone(sceneName) ?? 'NONE';
	const overrideZone = silkZoneMappings[mapZone];
	if (overrideZone) {
		mapZone = overrideZone;
	}

	const mappedRoom: RoomDataSilk = {
		game: 'silk',
		hasSpriteRenderer: room.hasSpriteRenderer,
		sortingOrder: room.sortingOrder,
		positionZ: room.positionZ,
		initialState: room.initialState,
		unmappedNoBounds: room.unmappedNoBounds,
		excludeBounds: room.excludeBounds,
		hideCondition: room.hideCondition,
		gameObjectName: room.gameObjectName,

		mapZone,
		zoomZones: [mapZone],
		sceneName,
		sceneNameForVisited,

		altColors,
		mappedIfAllMapped,
		visualBounds,
		playerPositionBounds: room.playerPositionBounds ? silkScaleBounds(room.playerPositionBounds) : null,
		texts: room.texts.filter((text) => !text.objectPath.includes('Next Area')).map(mapGeneratedText),
		allSprites,
		spritesByVariant,
		origColor,
		roomNameFormatted: room.sceneName, // TODO
		roomNameFormattedZoneExclusive: room.sceneName, // TODO
		zoneNameFormatted: mapZone,
		isMainGameObject: isMainGameObject as boolean, // set below to actual boolean
		visualBoundsAllSprites,
	};
	return mappedRoom;
});

export const silkMapData: MapDataSilk = {
	rooms: silkMapRooms,
	areaNames: silkMapDataGenerated.areaNames
		.filter((text) => !text.objectPath.includes('Next Area'))
		.map(mapGeneratedText),
	extends: Bounds.fromContainingBounds(silkMapRooms.map((r) => r.visualBoundsAllSprites).filter((b) => b != null)),
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

function makeSceneGroups() {
	const groups = Map.groupBy(silkMapData.rooms, (it) => it.sceneName);

	groups.forEach((rooms) => {
		// Not ideal. probably has some logic behind it.
		let didSetMainGameObject = false;
		for (const room of rooms) {
			if (room.isMainGameObject === false) continue;
			if (didSetMainGameObject) {
				room.isMainGameObject = false;
			} else {
				room.isMainGameObject = true;
				didSetMainGameObject = true;
			}
		}
		if (!didSetMainGameObject) {
			console.warn(`No main game object found for scene ${rooms[0].sceneName}, defaulting to first one`);
			rooms[0].isMainGameObject = true;
		}
	});

	return groups;
}

export const mapDataAllBySceneNameSilk = makeSceneGroups();
export const mapDataMainBySceneNameSilk = new Map(
	mapDataAllBySceneNameSilk
		.entries()
		.map(([sceneName, rooms]) => [sceneName, rooms.find((r) => r.isMainGameObject) ?? rooms[0]] as const),
);
export const mapDataByGameObjectNameSilk = new Map(silkMapData.rooms.map((it) => [it.gameObjectName, it]));
