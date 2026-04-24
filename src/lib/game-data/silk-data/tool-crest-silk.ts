import { ToolCrestNameSilk } from './tool-crest-silk.generated';

const toSubtitle: Record<ToolCrestNameSilk, string | null> = {
	Hunter: null,
	Hunter_v2: 'Evolved',
	Hunter_v3: 'Fully Evolved',
	Reaper: null,
	Wanderer: null,
	Warrior: null,
	Witch: null,
	Toolmaster: null,
	Spell: null,
	Cursed: null,
	Cloakless: null,
};

export function getToolCrestSubtitle(toolCrest: ToolCrestNameSilk) {
	return toSubtitle[toolCrest];
}
