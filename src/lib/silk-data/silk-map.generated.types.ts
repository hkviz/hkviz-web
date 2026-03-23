/**
 * TypeScript types that mirror the C# MapExportTypes for Silksong map export
 */

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
	Bellshrine: 'Bellshrine',
} as const;

export type SilkMapZoneGenerated = (typeof MapZonesGenerated)[keyof typeof MapZonesGenerated];

export interface SilkSpriteInfoGenerated {
	name: string;
	size: SilkVector2Generated;
	padding: SilkVector4Generated;
}

export type SilkPlayerDataTestTypeGenerated = 'Bool' | 'Int' | 'Float' | 'Enum' | 'String';
export type SilkPlayerDataTestNumTypeGenerated = 'Equal' | 'NotEqual' | 'LessThan' | 'MoreThan';
export type SilkPlayerDataTestStringTypeGenerated = 'Equal' | 'NotEqual' | 'Contains' | 'NotContains';

export interface SilkPlayerDataTestEntryGenerated {
	type: SilkPlayerDataTestTypeGenerated;
	fieldName: string;
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

export interface SilkSpriteConditionDataGenerated {
	sprite: SilkSpriteInfoGenerated;
	condition: SilkPlayerDataTestDataGenerated | null;
}

export interface SilkColorConditionData {
	color: SilkVector4Generated;
	condition: SilkPlayerDataTestDataGenerated | null;
}

export interface SilkVector2Generated {
	x: number;
	y: number;
}

export interface SilkVector3Generated {
	x: number;
	y: number;
	z: number;
}

export interface SilkVector4Generated {
	x: number;
	y: number;
	z: number;
	w: number;
}

export interface SilkExportBoundsGenerated {
	min: SilkVector3Generated;
	max: SilkVector3Generated;
}

export interface SilkTextDataGenerated {
	objectPath: string;
	convoName: string;
	sheetName: string;
	position: SilkVector3Generated;
	fontSize: number;
	fontWeight: number;
	bounds: SilkExportBoundsGenerated;
	origColor: SilkVector4Generated;
}

export interface SilkMapRoomDataGenerated {
	sceneName: string;
	gameObjectName: string;
	mapZone: SilkMapZoneGenerated;
	mappedParent: string | null;
	mappedIfAllMapped: string[] | null;
	texts: SilkTextDataGenerated[];
	hasSpriteRenderer: boolean;

	origColor: SilkVector4Generated | null;
	visualBounds: SilkExportBoundsGenerated | null;
	playerPositionBounds: SilkExportBoundsGenerated | null;

	// Sprite data
	initialSprite: SilkSpriteInfoGenerated | null;
	fullSprite: SilkSpriteInfoGenerated | null;
	rendererSprite: SilkSpriteInfoGenerated | null;
	altFullSprites: SilkSpriteConditionDataGenerated[] | null;
	altColors: SilkColorConditionData[] | null;

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
