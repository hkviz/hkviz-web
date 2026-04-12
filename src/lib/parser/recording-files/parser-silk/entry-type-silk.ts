export const entryTypeSilk = {
	HeroLocation: 0x01,

	// Scene
	SceneChangeSingleShort: 0x02,
	SceneChangeSingleLong: 0x03,
	SceneChangeAddShort: 0x04,
	SceneChangeAddLong: 0x05,
	SceneBoundary: 0x06,

	// Time
	TimestampFull: 0x07,
	TimestampBackwards: 0x08,
	TimestampAddByte: 0x09,
	TimestampAddShort: 0x10,
};

export type EntryTypeSilk = (typeof entryTypeSilk)[keyof typeof entryTypeSilk];
