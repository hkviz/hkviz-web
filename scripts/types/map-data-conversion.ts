import * as d3 from 'd3';
import { Bounds, boundsQuantize } from '../../src/lib/game-data/shared/bounds.ts';
import { colorFromRgbVector } from '../../src/lib/game-data/shared/colors.ts';
import type { MapTextData } from '../../src/lib/game-data/shared/map-text-data.ts';
import type { SpriteInfoGenerated } from '../../src/lib/game-data/shared/sprite-info-generated.ts';
import { spriteInfoBounds } from '../../src/lib/game-data/shared/sprite-info-mapper.ts';
import type {
	MapDataSilk,
	RoomDataSilk,
	SilkSpriteInfo,
	SomeSpriteTypeSilk,
	SpriteConditionDataSilk,
} from '../../src/lib/game-data/silk-data/map-data-silk.types.ts';
import type { MapZoneSilk } from '../../src/lib/game-data/silk-data/player-data/enum/mapzone-enum-silk.generated.ts';
import { sceneNameGetZone } from '../../src/lib/game-data/silk-data/scene-ids-get-zone.ts';
import { sceneNameToIdMetaSilk } from '../../src/lib/game-data/silk-data/scene-ids-silk.ts';
import { silkScaleBounds } from '../../src/lib/game-data/silk-data/silk-scaling.ts';
import type { SilkMapDataGenerated, SilkTextDataGenerated } from './map-data-mod-output-types.ts';

function mapGeneratedText(text: SilkTextDataGenerated): MapTextData {
	const [sheetName, convoName] = text.textKey.split('.');
	return {
		objectPath: text.objectPath,
		textKey: text.textKey,
		sheetName,
		convoName,
		fontSize: text.fontSize,
		fontWeight: text.fontWeight,
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
	const bounds = boundsQuantize(spriteInfoBounds(roomBounds, sprite), 3);
	return {
		name: sprite.name,
		// size: vec2Quantize(vec2Like(sprite.size), 0),
		// padding: vec4Quantize(vec4Like(sprite.padding), 3),
		visualBounds: bounds,
	};
}

export function mapDataConversionForGen(silkMapDataGenerated: SilkMapDataGenerated): MapDataSilk {
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

	const silkZoneMappings: Partial<Record<MapZoneSilk, MapZoneSilk>> = {
		CORAL_CAVERNS: 'RED_CORAL_GORGE',
	};

	const roomsSorted = silkMapDataGenerated.rooms.sort((a, b) => {
		if (a.sortingOrder !== b.sortingOrder) {
			return a.sortingOrder - b.sortingOrder;
		}
		if (a.positionZ !== b.positionZ) {
			return b.positionZ - a.positionZ;
		}
		return 0;
	});

	const silkMapRooms = roomsSorted.map((room) => {
		const sceneNameForVisited = room.sceneName;

		const idMeta = sceneNameToIdMetaSilk[sceneNameForVisited];
		const sceneName = idMeta?.actualSceneName ?? sceneNameForVisited;
		const isMainGameObject = sceneName === sceneNameForVisited;

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

		// sorted by precedence --> the first sprite that is displayable is displayed.
		const includeFullSprite = room.initialState === 'Rough'; // game only ever displays full sprite if a room is initially rough.

		const allSpritesUnfiltered: (SomeSpriteTypeSilk | null)[] = [
			...(altFullSprites ?? []),
			includeFullSprite && fullSprite ? { type: 'full', sprite: fullSprite, variant: 'full' } : null,
			initialSprite ? { type: 'initial', sprite: initialSprite, variant: 'initial' } : null,
		];

		const allSprites = allSpritesUnfiltered.filter((s) => s != null);

		const origColor = room.origColor
			? d3.hsl(colorFromRgbVector(room.origColor))
			: (origColorByZone.get(room.mapZone) ?? d3.hsl(0, 0, 1)); // fallback to white if no color info at all

		const mappedIfAllMapped = room.mappedParent ? [room.mappedParent] : room.mappedIfAllMapped;

		const spriteBounds = allSprites.map((s) => s.sprite.visualBounds);
		const visualBoundsAllSprites = spriteBounds.length > 0 ? Bounds.fromContainingBounds(spriteBounds) : null;

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
			// sortingOrder: room.sortingOrder,
			// positionZ: room.positionZ,
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
			visualBounds: visualBounds ? boundsQuantize(visualBounds, 3) : null,
			playerPositionBounds: room.playerPositionBounds
				? boundsQuantize(silkScaleBounds(room.playerPositionBounds), 3)
				: null,
			texts: room.texts.filter((text) => !text.objectPath.includes('Next Area')).map(mapGeneratedText),
			allSprites,
			origColor,
			roomNameFormatted: room.sceneName, // TODO
			roomNameFormattedZoneExclusive: room.sceneName, // TODO
			zoneNameFormatted: mapZone,
			isMainGameObject: isMainGameObject as boolean, // set below to actual boolean
			visualBoundsAllSprites,
		};
		return mappedRoom;
	});

	const silkMapData: MapDataSilk = {
		rooms: silkMapRooms,
		areaNames: silkMapDataGenerated.areaNames
			.filter((text) => !text.objectPath.includes('Next Area'))
			.map(mapGeneratedText),
		extends: Bounds.fromContainingBounds(
			silkMapRooms.map((r) => r.visualBoundsAllSprites).filter((b) => b != null),
		),
	};

	return silkMapData;
}
