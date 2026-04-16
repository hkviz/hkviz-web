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

export function isSubSceneNameSilk(name: string) {
	return subSceneNameSuffixesSilk.some((it) => name.endsWith(it));
}

export function splitSuffixSceneNameSilk(name: string) {
	for (const suffix of subSceneNameSuffixesSilk) {
		if (name.endsWith(suffix)) {
			return [name.slice(0, -suffix.length), suffix] as const;
		}
	}
	return [name, undefined] as const;
}
