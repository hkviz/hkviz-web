import type { AggregationMaximumMode } from './aggregation-max-mode';

export const virtualSceneName = {
	all: ':all:',
	zone(zoneName: string) {
		return `:zone:${zoneName}`;
	},
	groupBossSequence(bossSequenceName: string) {
		return `group_boss_seq:${bossSequenceName}`;
	},
	bossSequence(bossSequenceName: string, sceneName: string) {
		return `boss_seq:${bossSequenceName}:${sceneName}`;
	},
};

export function getMaximumModeOfVirtualScene(sceneName: string): AggregationMaximumMode | null {
	if (sceneName === virtualSceneName.all) return null;
	if (sceneName.startsWith(':zone:')) return 'overZones';
	return 'overScenes';
}
