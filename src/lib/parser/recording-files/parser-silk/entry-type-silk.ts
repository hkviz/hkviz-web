export const entryTypeSilk = {
	// File Meta
	SessionStart: 0x03,
	SessionEnd: 0x05,

	HeroLocation: 0x01,

	// Scene
	SceneChangeSingle: 0x02,
	SceneChangeAdd: 0x04,
	SceneBoundary: 0x06,

	// Time
	TimestampFull: 0x07,
	TimestampBackwards: 0x08,
	TimestampAddByte: 0x09,
	TimestampAddShort: 0x10,

	// PlayerData
	PlayerDataBool: 0x0a,
	PlayerDataInt: 0x0b,
	PlayerDataFloat: 0x0c,
	PlayerDataString: 0x0d,
	PlayerDataGuid: 0x0e,
	PlayerDataEnum: 0x0f,
	PlayerDataULong: 0x11,
	PlayerDataVector3: 0x12,
	PlayerDataVector2: 0x13,
	PlayerDataIntListFull: 0x14,
	PlayerDataIntListDelta: 0x15,
	PlayerDataStringListFull: 0x16,
	PlayerDataStringListDelta: 0x17,
	PlayerDataStringSetFull: 0x18,
	PlayerDataStringSetDelta: 0x19,
	PlayerDataNamedMapFull: 0x1a,
	PlayerDataNamedMapDelta: 0x1b,
	PlayerDataStoryEventListFull: 0x1c,
	PlayerDataStoryEventListDelta: 0x1d,
	PlayerDataWrappedVector2ListFull: 0x1e,
	PlayerDataWrappedVector2ListDelta: 0x1f,

	// SceneData
	SceneDataBool: 0x21,
	SceneDataInt: 0x22,
	SceneDataGeoRock: 0x23,
} as const;

export type EntryTypeSilk = (typeof entryTypeSilk)[keyof typeof entryTypeSilk];

export const entryTypeSilkByValue: Map<number, keyof typeof entryTypeSilk> = new Map(
	Object.entries(entryTypeSilk).map(([key, value]) => [value, key] as const),
) as Map<number, keyof typeof entryTypeSilk>;

export const entryTypeNameSilk = (entryType: EntryTypeSilk): string =>
	entryTypeSilkByValue.get(entryType) ?? `unknown_entry_type_${entryType}`;
