import { tailwindChartColors } from '~/lib/viz/colors';
import { createSplitGroup } from '../splits-shared/split-group';

export const splitGroupsSilk = {
	...createSplitGroup('ending', {
		displayName: 'Endings',
		description: 'Endings.',
		defaultShown: true,
		color: tailwindChartColors.sky,
	}),
	...createSplitGroup('boss', {
		displayName: 'Boss',
		description: 'Defeated bosses.',
		defaultShown: true,
		color: tailwindChartColors.pink,
	}),
	...createSplitGroup('crestCollection', {
		displayName: 'Crest pickup',
		description: 'Collected tool crests.',
		defaultShown: true,
		color: tailwindChartColors.slate,
	}),
	...createSplitGroup('toolCollection', {
		displayName: 'Tool pickup',
		description: 'Collected tools and tool upgrades',
		defaultShown: true,
		color: tailwindChartColors.red,
	}),
	...createSplitGroup('abilities', {
		displayName: 'Ability',
		description: 'Obtained ability.',
		defaultShown: true,
		color: tailwindChartColors.green,
	}),
	...createSplitGroup('questStarts', {
		displayName: 'Quest start',
		description: 'Started quests.',
		defaultShown: true,
		color: tailwindChartColors.amberLight,
	}),
	...createSplitGroup('questCompletion', {
		displayName: 'Quest completion',
		description: 'Completed quests.',
		defaultShown: true,
		color: tailwindChartColors.orange,
	}),
	...createSplitGroup('collectables', {
		displayName: 'Collectable',
		description: 'Collected collectables.',
		defaultShown: true,
		color: tailwindChartColors.indigo,
	}),
	...createSplitGroup('relicCollection', {
		displayName: 'Relic',
		description: 'Collected relics.',
		defaultShown: true,
		color: tailwindChartColors.emerald,
	}),
};

export const splitGroupsArraySilk = Object.values(splitGroupsSilk);
