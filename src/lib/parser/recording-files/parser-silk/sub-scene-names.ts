// taken from Silksong source.
// WorldInfo.SubSceneNameSuffixes
export const subSceneNameSuffixesSilk = [
	'_boss_defeated',
	'_boss',
	'_preload',
	'_bellway',
	'_mapper',
	'_boss_golem',
	'_boss_golem_rest',
	'_boss_beastfly',
	'_additive',
	'_pre',
	'_caravan',
	'_festival',
];

export function isSubSceneName(name: string) {
	return subSceneNameSuffixesSilk.some((it) => name.endsWith(it));
}
