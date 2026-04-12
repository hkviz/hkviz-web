import { Bounds } from '../shared/bounds';
import { RoomDataBase } from '../shared/map-shared';
import { Vector3Like, Vector4Like } from '../shared/vector-like';
import { MapZonesGenerated as MapZonesGeneratedSilk } from './map-data-silk.generated.types';

export const MapZonesSilk = MapZonesGeneratedSilk;

export type MapZoneSilk = (typeof MapZonesSilk)[keyof typeof MapZonesSilk];

export interface SilkSpriteInfo {
	name: string;
	visualBounds: Bounds;
}

export type SilkPlayerDataTestType = 'Bool' | 'Int' | 'Float' | 'Enum' | 'String';
export type SilkPlayerDataTestNumType = 'Equal' | 'NotEqual' | 'LessThan' | 'MoreThan';
export type SilkPlayerDataTestStringType = 'Equal' | 'NotEqual' | 'Contains' | 'NotContains';

export interface PlayerDataTestEntrySilk {
	type: SilkPlayerDataTestType;
	fieldName: string;
	boolValue: boolean | null;
	numType: SilkPlayerDataTestNumType | null;
	intValue: number | null;
	floatValue: number | null;
	stringValue: string | null;
	stringType: SilkPlayerDataTestStringType | null;
}

export interface PlayerDataTestGroupSilk {
	tests: PlayerDataTestEntrySilk[];
}

export interface PlayerDataTestDataSilk {
	playerDataOverrideType: string | null;
	testGroups: PlayerDataTestGroupSilk[];
}

export interface SpriteConditionDataSilk {
	type: 'alt-full-sprite';
	sprite: SilkSpriteInfo;
	condition: PlayerDataTestDataSilk | null;
	variant: `alt-full-sprite-${number}`;
}

export type SomeSpriteTypeSilk =
	| SpriteConditionDataSilk
	| {
			type: 'initial';
			sprite: SilkSpriteInfo;
			variant: 'initial';
	  }
	| {
			type: 'full';
			sprite: SilkSpriteInfo;
			variant: 'full';
	  };

export type RoomSpriteVariantSilk = SomeSpriteTypeSilk['variant'];

export interface ColorConditionDataSilk {
	color: Vector4Like;
	condition: PlayerDataTestDataSilk | null;
}

export interface TextDataSilk {
	objectPath: string;
	convoName: string;
	sheetName: string;
	position: Vector3Like;
	fontSize: number;
	fontWeight: number;
	bounds: Bounds;
	origColor: Vector4Like;
}

export interface RoomDataSilk extends RoomDataBase<'silk'> {
	mapZone: MapZoneSilk;
	// mappedParent: string | null; -> moved to mappedIfAllMapped
	mappedIfAllMapped: string[] | null;
	texts: TextDataSilk[];
	hasSpriteRenderer: boolean;

	visualBounds: Bounds | null;
	playerPositionBounds: Bounds | null;

	sortingOrder: number;
	positionZ: number;

	// Sprite data
	/*initialSprite: SilkSpriteInfo | null;
	fullSprite: SilkSpriteInfo | null;
	rendererSprite: SilkSpriteInfo | null;
	altFullSprites: SilkSpriteConditionData[] | null;
	altColors: SilkColorConditionData[] | null;*/

	allSprites: SomeSpriteTypeSilk[];
	spritesByVariant: Record<string, SomeSpriteTypeSilk>;

	// State information
	initialState: 'Hidden' | 'Rough' | 'Full';
	unmappedNoBounds: boolean;
	excludeBounds: boolean;
	hideCondition: PlayerDataTestDataSilk | null;
}

export interface MapDataSilk {
	rooms: RoomDataSilk[];
	areaNames: TextDataSilk[];
}

// /**
//  * Parse map zone from room data with fallback
//  */
// export function parseMapZone(zone: string | null): SilkMapZone {
// 	if (!zone) return 'Unknown' as SilkMapZone;

// 	const normalized = zone.toLowerCase();

// 	for (const [key, value] of Object.entries(MapZones)) {
// 		if (value.toLowerCase() === normalized) {
// 			return value;
// 		}
// 	}

// 	return zone as SilkMapZone;
// }

// /**
//  * Get all unique map zones from export data
//  */
// export function getUniqueZones(data: SilkMapData): SilkMapZone[] {
// 	const zones = new Set<SilkMapZone>();
// 	for (const room of data.rooms) {
// 		zones.add(room.mapZone);
// 	}
// 	return Array.from(zones).sort();
// }

// /**
//  * Filter rooms by zone
//  */
// export function getRoomsByZone(data: SilkMapData, zone: SilkMapZone): SilkMapRoomData[] {
// 	return data.rooms.filter((room) => room.mapZone === zone);
// }

// /**
//  * Get statistics about conditions
//  */
// export function getConditionStats(data: SilkMapData) {
// 	let totalConditions = 0;
// 	let roomsWithHideCondition = 0;
// 	let altSpritesWithCondition = 0;
// 	let altColorsWithCondition = 0;

// 	for (const room of data.rooms) {
// 		if (room.hideCondition?.testGroups?.length) {
// 			roomsWithHideCondition++;
// 			totalConditions++;
// 		}

// 		if (room.altFullSprites) {
// 			for (const alt of room.altFullSprites) {
// 				if (alt.condition?.testGroups?.length) {
// 					altSpritesWithCondition++;
// 					totalConditions++;
// 				}
// 			}
// 		}

// 		if (room.altColors) {
// 			for (const alt of room.altColors) {
// 				if (alt.condition?.testGroups?.length) {
// 					altColorsWithCondition++;
// 					totalConditions++;
// 				}
// 			}
// 		}
// 	}

// 	return {
// 		totalRooms: data.rooms.length,
// 		totalConditions,
// 		roomsWithHideCondition,
// 		altSpritesWithCondition,
// 		altColorsWithCondition,
// 	};
// }

// /**
//  * Flatten all PlayerDataTest conditions with their context
//  */
// export interface SilkConditionWithContext {
// 	roomName: string;
// 	mapZone: SilkMapZone;
// 	conditionType: 'hideCondition' | 'altSprite' | 'altColor';
// 	condition: SilkPlayerDataTestData;
// 	description: string;
// }

// export function getAllConditions(data: SilkMapData): SilkConditionWithContext[] {
// 	const conditions: SilkConditionWithContext[] = [];

// 	for (const room of data.rooms) {
// 		// Hide conditions
// 		if (room.hideCondition?.testGroups?.length) {
// 			conditions.push({
// 				roomName: room.sceneName,
// 				mapZone: room.mapZone,
// 				conditionType: 'hideCondition',
// 				condition: room.hideCondition,
// 				description: `Hide condition for ${room.sceneName}`,
// 			});
// 		}

// 		// Alt sprite conditions
// 		if (room.altFullSprites) {
// 			for (let i = 0; i < room.altFullSprites.length; i++) {
// 				const alt = room.altFullSprites[i];
// 				if (alt.condition?.testGroups?.length) {
// 					conditions.push({
// 						roomName: room.sceneName,
// 						mapZone: room.mapZone,
// 						conditionType: 'altSprite',
// 						condition: alt.condition,
// 						description: `Alt sprite #${i + 1} condition for ${room.sceneName}`,
// 					});
// 				}
// 			}
// 		}

// 		// Alt color conditions
// 		if (room.altColors) {
// 			for (let i = 0; i < room.altColors.length; i++) {
// 				const alt = room.altColors[i];
// 				if (alt.condition?.testGroups?.length) {
// 					conditions.push({
// 						roomName: room.sceneName,
// 						mapZone: room.mapZone,
// 						conditionType: 'altColor',
// 						condition: alt.condition,
// 						description: `Alt color #${i + 1} condition for ${room.sceneName}`,
// 					});
// 				}
// 			}
// 		}
// 	}

// 	return conditions;
// }
