import { tailwindChartColors } from '~/lib/viz/colors';
import { createSplitGroup } from '../splits-shared/split-group';

export const splitGroupsHollow = {
	...createSplitGroup('dreamer', {
		displayName: 'Dreamers',
		description: 'Broken Dreamer seals',
		defaultShown: true,
		color: tailwindChartColors.sky,
	}),
	...createSplitGroup('boss', {
		displayName: 'Bosses',
		description: 'Defeated bosses. Not including bosses which are fought again in Godhome.',
		defaultShown: true,
		color: tailwindChartColors.rose,
	}),
	...createSplitGroup('abilities', {
		displayName: 'Abilities',
		description: 'Obtained abilities. (E.g. spells)',
		defaultShown: true,
		color: tailwindChartColors.green,
	}),
	...createSplitGroup('items', {
		displayName: 'Items',
		description: 'Collected items (e.g. the map or delicate flower). Not including charm collections and relicts.',
		defaultShown: true,
		color: tailwindChartColors.indigo,
	}),
	...createSplitGroup('charmCollection', {
		displayName: 'Charms',
		description: 'Collected charms and charm upgrades',
		defaultShown: true,
		color: tailwindChartColors.amberLight,
	}),
};

export const splitGroupsArrayHollow = Object.values(splitGroupsHollow);
