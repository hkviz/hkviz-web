import { CrestNameSilk } from './crests-silk.generated';

export const crestNameToIdSilk: Record<CrestNameSilk, number> = {
	Hunter: 1,
	Hunter_v2: 2,
	Hunter_v3: 3,
	Reaper: 4,
	Wanderer: 5,
	Warrior: 6,
	Witch: 7,
	Toolmaster: 8,
	Spell: 9,
	Cursed: 10,
	Cloakless: 11,
};

export const crestIdToNameSilk: Record<number, CrestNameSilk> = Object.fromEntries(
	Object.entries(crestNameToIdSilk).map(([name, id]) => [id, name as CrestNameSilk]),
);

export const crestNameToHudSpriteSilk: Record<CrestNameSilk, { normalHud: string; seelSoulHud: string }> = {
	Hunter: {
		normalHud: '/silk-sprites/crest/HUD_frame_v020005 1.png',
		seelSoulHud: '/silk-sprites/crest/HUD_Frame_Standard_SS0005.png',
	},
	Hunter_v2: {
		normalHud: '/silk-sprites/crest/HUD_frame_Hunter_V20006.png',
		seelSoulHud: '/silk-sprites/crest/HUD_Frame_Hunter_V2_SS0006.png',
	},
	Hunter_v3: {
		normalHud: '/silk-sprites/crest/HUD_frame_Hunter_V30006.png',
		seelSoulHud: '/silk-sprites/crest/HUD_Frame_Hunter_V3_SS0006.png',
	},
	Reaper: {
		normalHud: '/silk-sprites/crest/HUD_Frames_Reaper0008.png',
		seelSoulHud: '/silk-sprites/crest/HUD_Frame_Reaper_SS0008.png',
	},
	Wanderer: {
		normalHud: '/silk-sprites/crest/HUD_frame_Wanderer0005.png',
		seelSoulHud: '/silk-sprites/crest/HUD_Frames_Wanderer_SS0005.png',
	},
	Warrior: {
		normalHud: '/silk-sprites/crest/HUD_frame_Warrior0013.png',
		seelSoulHud: '/silk-sprites/crest/HUD_Frame_Warrior_SS0013.png',
	},
	Witch: {
		normalHud: '/silk-sprites/crest/HUD_Frame_Witch0007.png',
		seelSoulHud: '/silk-sprites/crest/HUD_Frame_Witch_SS0007.png',
	},
	Toolmaster: {
		normalHud: '/silk-sprites/crest/HUD_frame_Toolmaster0010.png',
		seelSoulHud: '/silk-sprites/crest/HUD_Frames_Toolmaster_SS0014.png',
	},
	Spell: {
		normalHud: '/silk-sprites/crest/HUD_frame_Shaman0008.png',
		seelSoulHud: '/silk-sprites/crest/HUD_Frames_Shaman_SS0008.png',
	},
	Cursed: {
		normalHud: '/silk-sprites/crest/HUD_Frame_Cursed0008.png',
		seelSoulHud: '/silk-sprites/crest/HUD_Frame_Cursed_SS0008.png',
	},
	Cloakless: {
		normalHud: '/silk-sprites/crest/HUD_Frame_Cloakless0005.png',
		seelSoulHud: '/silk-sprites/crest/HUD_Frame_Cloakless_SS0005.png',
	},
};
export const brokenSpriteSilk = '/silk-sprites/crest/break_hud.png';