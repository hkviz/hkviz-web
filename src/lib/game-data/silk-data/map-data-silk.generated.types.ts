/**
 * TypeScript types that mirror the C# MapExportTypes for Silksong map export.
 *
 * Not generated, but types for generated data.
 */

import type { SpriteInfoGenerated } from '../shared/sprite-info-generated.ts';
import type { Vector3Like, Vector4Like } from '../shared/vector-like.ts';
import type { PlayerDataFieldNameSilk } from './player-data-silk.generated.ts';

export const MapZonesGenerated = {
	Tut: 'Tut',
	Bonetown: 'Bonetown',
	Bone: 'Bone',
	Crawl: 'Crawl',
	Dock: 'Dock',
	Weavehome: 'Weavehome',
	Ant: 'Ant',
	Wilds: 'Wilds',
	Greymoor: 'Greymoor',
	Dust: 'Dust',
	DustMaze: 'Dust Maze',
	Wisp: 'Wisp',
	Swamp: 'Swamp',
	Aqueduct: 'Aqueduct',
	Belltown: 'Belltown',
	Shellwood: 'Shellwood',
	BlastedSteps: 'Blasted_Steps',
	CoralCaves: 'Coral_Caves',
	Slab: 'Slab',
	Peak: 'Peak',
	Song: 'Song',
	SongGate: 'Song_Gate',
	Under: 'Under',
	Library: 'Library',
	Cog: 'Cog',
	Ward: 'Ward',
	Hang: 'Hang',
	Arborium: 'Arborium',
	Cradle: 'Cradle',
	Clover: 'Clover',
	Abyss: 'Abyss',
	Surface: 'Surface',
} as const;

export type SilkMapZoneGenerated = (typeof MapZonesGenerated)[keyof typeof MapZonesGenerated];

export type SilkPlayerDataTestTypeGenerated = 'Bool' | 'Int' | 'Float' | 'Enum' | 'String';
export type SilkPlayerDataTestNumTypeGenerated = 'Equal' | 'NotEqual' | 'LessThan' | 'MoreThan';
export type SilkPlayerDataTestStringTypeGenerated = 'Equal' | 'NotEqual' | 'Contains' | 'NotContains';

export interface SilkPlayerDataTestEntryGenerated {
	type: SilkPlayerDataTestTypeGenerated;
	fieldName: PlayerDataFieldNameSilk;
	boolValue: boolean | null;
	numType: SilkPlayerDataTestNumTypeGenerated | null;
	intValue: number | null;
	floatValue: number | null;
	stringValue: string | null;
	stringType: SilkPlayerDataTestStringTypeGenerated | null;
}

export interface SilkPlayerDataTestGroupGenerated {
	tests: SilkPlayerDataTestEntryGenerated[];
}

export interface SilkPlayerDataTestDataGenerated {
	playerDataOverrideType: string | null;
	testGroups: SilkPlayerDataTestGroupGenerated[];
}

export interface SilkSpriteInfoGenerated extends SpriteInfoGenerated {
	nameShort: string;
}

export interface SilkSpriteConditionDataGenerated {
	sprite: SilkSpriteInfoGenerated;
	condition: SilkPlayerDataTestDataGenerated | null;
}

export interface SilkColorConditionDataGenerated {
	color: Vector4Like;
	condition: SilkPlayerDataTestDataGenerated | null;
}

export interface SilkExportBoundsGenerated {
	min: Vector3Like;
	max: Vector3Like;
}

export interface SilkTextDataGenerated {
	objectPath: string;
	textKey: string;
	position: Vector3Like;
	fontSize: number;
	fontWeight: number;
	bounds: SilkExportBoundsGenerated;
	origColor: Vector4Like;
}

export interface SilkMapRoomDataGenerated {
	sceneName: string;
	gameObjectName: string;
	mapZone: SilkMapZoneGenerated;
	mappedParent: string | null;
	mappedIfAllMapped: string[] | null;
	texts: SilkTextDataGenerated[];
	hasSpriteRenderer: boolean;

	origColor: Vector4Like | null;
	visualBounds: SilkExportBoundsGenerated | null;
	playerPositionBounds: SilkExportBoundsGenerated | null;

	sortingOrder: number;
	positionZ: number;

	// Sprite data
	initialSprite: SilkSpriteInfoGenerated | null;
	fullSprite: SilkSpriteInfoGenerated | null;
	// rendererSprite: SilkSpriteInfoGenerated | null;
	altFullSprites: SilkSpriteConditionDataGenerated[] | null;
	altColors: SilkColorConditionDataGenerated[] | null;

	// State information
	initialState: 'Hidden' | 'Rough' | 'Full';
	unmappedNoBounds: boolean;
	excludeBounds: boolean;
	hideCondition: SilkPlayerDataTestDataGenerated | null;
}

export interface SilkMapDataGenerated {
	rooms: SilkMapRoomDataGenerated[];
	areaNames: SilkTextDataGenerated[];
}
