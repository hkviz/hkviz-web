import { Vector2 } from '../shared/vector2';
import type { ToolCrestNameSilk } from './tool-crest-silk.generated';

export const crestNameToIdSilk: Record<ToolCrestNameSilk, number> = {
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

export const crestIdToNameSilk: Record<number, ToolCrestNameSilk> = Object.fromEntries(
	Object.entries(crestNameToIdSilk).map(([name, id]) => [id, name as ToolCrestNameSilk]),
);

interface CrestHudSprite {
	normalHud: string;
	seelSoulHud: string;

	size: Vector2;
	circleCenter: Vector2;
}

export const crestNameToHudSpriteSilk: Record<ToolCrestNameSilk, CrestHudSprite> = {
	Hunter: {
		normalHud: '/silk-sprites/crest/HUD_frame_v020005 1.png',
		seelSoulHud: '/silk-sprites/crest/HUD_Frame_Standard_SS0005.png',
		size: new Vector2(307, 94),
		circleCenter: new Vector2(49, 49),
	},
	Hunter_v2: {
		normalHud: '/silk-sprites/crest/HUD_frame_Hunter_V20006.png',
		seelSoulHud: '/silk-sprites/crest/HUD_Frame_Hunter_V2_SS0006.png',
		size: new Vector2(401, 109),
		circleCenter: new Vector2(96, 55),
	},
	Hunter_v3: {
		normalHud: '/silk-sprites/crest/HUD_frame_Hunter_V30006.png',
		seelSoulHud: '/silk-sprites/crest/HUD_Frame_Hunter_V3_SS0006.png',
		size: new Vector2(461, 128),
		circleCenter: new Vector2(106, 64),
	},
	Reaper: {
		normalHud: '/silk-sprites/crest/HUD_Frames_Reaper0008.png',
		seelSoulHud: '/silk-sprites/crest/HUD_Frame_Reaper_SS0008.png',
		size: new Vector2(449, 173),
		circleCenter: new Vector2(96, 83),
	},
	Wanderer: {
		normalHud: '/silk-sprites/crest/HUD_frame_Wanderer0005.png',
		seelSoulHud: '/silk-sprites/crest/HUD_Frames_Wanderer_SS0005.png',
		size: new Vector2(296, 144),
		circleCenter: new Vector2(81, 81),
	},
	Warrior: {
		normalHud: '/silk-sprites/crest/HUD_frame_Warrior0013.png',
		seelSoulHud: '/silk-sprites/crest/HUD_Frame_Warrior_SS0013.png',
		size: new Vector2(451, 144),
		circleCenter: new Vector2(110, 94),
	},
	Witch: {
		normalHud: '/silk-sprites/crest/HUD_Frame_Witch0007.png',
		seelSoulHud: '/silk-sprites/crest/HUD_Frame_Witch_SS0007.png',
		size: new Vector2(422, 107),
		circleCenter: new Vector2(59, 59),
	},
	Toolmaster: {
		normalHud: '/silk-sprites/crest/HUD_frame_Toolmaster0010.png',
		seelSoulHud: '/silk-sprites/crest/HUD_Frames_Toolmaster_SS0014.png',
		size: new Vector2(388, 138),
		circleCenter: new Vector2(68, 74),
	},
	Spell: {
		normalHud: '/silk-sprites/crest/HUD_frame_Shaman0008.png',
		seelSoulHud: '/silk-sprites/crest/HUD_Frames_Shaman_SS0008.png',
		size: new Vector2(238, 148),
		circleCenter: new Vector2(85, 79),
	},
	Cursed: {
		normalHud: '/silk-sprites/crest/HUD_Frame_Cursed0008.png',
		seelSoulHud: '/silk-sprites/crest/HUD_Frame_Cursed_SS0008.png',
		size: new Vector2(360, 115),
		circleCenter: new Vector2(60, 58),
	},
	Cloakless: {
		normalHud: '/silk-sprites/crest/HUD_Frame_Cloakless0005.png',
		seelSoulHud: '/silk-sprites/crest/HUD_Frame_Cloakless_SS0005.png',
		size: new Vector2(94, 94),
		circleCenter: new Vector2(48, 48),
	},
};
export const brokenSpriteSilk = '/silk-sprites/crest/break_hud.png';
