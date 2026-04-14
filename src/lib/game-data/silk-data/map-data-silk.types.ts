import * as d3 from 'd3';
import { Bounds } from '../shared/bounds';
import { RoomDataBase } from '../shared/map-shared';
import { Vector3Like } from '../shared/vector-like';
import { MapZonesGenerated as MapZonesGeneratedSilk } from './map-data-silk.generated.types';
import { PlayerDataFieldNameSilk } from './player-data-silk.generated';

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
	fieldName: PlayerDataFieldNameSilk;
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

export interface ColorConditionDataSilk {
	color: d3.HSLColor;
	condition: PlayerDataTestDataSilk | null;
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

export interface TextDataSilk {
	objectPath: string;
	convoName: string;
	sheetName: string;
	position: Vector3Like;
	fontSize: number;
	fontWeight: number;
	bounds: Bounds;
	origColor: d3.HSLColor;
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
	altFullSprites: SilkSpriteConditionData[] | null;*/

	altColors: ColorConditionDataSilk[] | null;

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
