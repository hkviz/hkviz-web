export const entryTypeSilk = {
	HeroLocation: 0x01,
	SceneChangeSingleShort: 0x02,
	SceneChangeSingleLong: 0x03,
	SceneChangeAddShort: 0x04,
	SceneChangeAddLong: 0x05,
	SceneBoundary: 0x06,
};

export type EntryTypeSilk = (typeof entryTypeSilk)[keyof typeof entryTypeSilk];
