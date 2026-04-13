import { assertNever } from '../parser';
import { GameId } from '../types/game-ids';

export const coinImg = '/ingame-sprites/HUD_coin_shop.png';
export const shadeImg = '/ingame-sprites/bestiary/bestiary_hollow-shade_s.png';
export const spellUpImg = '/ingame-sprites/inventory/Inv_0024_spell_scream_01.png';
export const spellFireballImg = '/ingame-sprites/inventory/Inv_0025_spell_fireball_01.png';
export const spellDownImg = '/ingame-sprites/inventory/Inv_0026_spell_quake_01.png';
export const focusImg = '/ingame-sprites/inventory/Inv_0029_spell_core.png';
export const vesselImg = '/ingame-sprites/hud/select_game_HUD_0000_magic_orb.png';
export const vesselSteelSoul = '/ingame-sprites/hud/select_game_HUD_0000_magic_orb_steel.png';
export const dreamNailImg = '/ingame-sprites/inventory/dream_nail_0003_1.png';
export const dreamNailAwokenImg = '/ingame-sprites/inventory/dream_nail_0000_4.png';
export const grubImage = '/ingame-sprites/pin/pin_grub_location.png';

export const blueMaskImg = '/ingame-sprites/hud/edited/blueMask.png';
export const emptyMaskImg = '/ingame-sprites/hud/edited/emptyMask.png';
export const maskImg = '/ingame-sprites/hud/select_game_HUD_0001_health.png';
export const steelMaskImg = '/ingame-sprites/hud/select_game_HUD_0001_health_steel.png';

export const shadePinSrc = '/ingame-sprites/pin/Shade_Pin.png';
export const dreamGatePinSrc = '/ingame-sprites/pin/Dream_Gate_Pin_0000_3.png';

export const coin2 = '/ingame-sprites/hud/HUD_coin_v020004.png';
export const healthFrameSteelSoulBrokenImg = '/ingame-sprites/hud/break_hud.png';
export const healthFrameSteelSoulSmallImg = '/ingame-sprites/hud/mode_select_Steel_Soul_HUD.png';
export const healthFrameImg = '/ingame-sprites/hud/select_game_HUD_0002_health_frame.png';
export const healthFrameSteelSoulImg = '/ingame-sprites/hud/select_game_HUD_Steel_Soul.png';
export const knightPinSrc = '/ingame-sprites/Map_Knight_Pin_Compass.png';

// Silk
export const hornetPinSrc = '/silk-sprites/Map_Knight_Pin_Compass_idle0000.png';
export const shellShardImg = '/silk-sprites/shell_shard_icon_gleam.png';
export const rosaryIconImg = '/silk-sprites/I_rosary_icon_clean.png';
export const hornetDeathPinImg = '/silk-sprites/Shade_Pin.png';
export const hornetHealthImg = '/silk-sprites/select_game_HUD_0001_health.png';
export const hornetHealingImg = '/silk-sprites/Inv_0029_spell_core.png';

export function heroPinSource(game: GameId) {
	if (game === 'silk') {
		return hornetPinSrc;
	} else if (game === 'hollow') {
		return knightPinSrc;
	}
	assertNever(game);
}

export function heroPinSourceOrUndefined(game: GameId | undefined | null) {
	if (game) return heroPinSource(game);
	return undefined;
}

export function corpsePinSource(game: GameId) {
	if (game === 'silk') {
		return hornetDeathPinImg;
	} else if (game === 'hollow') {
		return shadePinSrc;
	}
}
export function corpsePinSourceOrUndefined(game: GameId | undefined | null) {
	if (game) return corpsePinSource(game);
	return undefined;
}
