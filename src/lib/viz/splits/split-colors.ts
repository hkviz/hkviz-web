import { type RecordingSplitGroupName } from '../../parser';
import { type ColorClasses, tailwindChartColors } from '../colors';

export const splitColors = {
	dreamer: tailwindChartColors.sky,
	boss: tailwindChartColors.rose,
	abilities: tailwindChartColors.green,
	items: tailwindChartColors.indigo,
	charmCollection: tailwindChartColors.amberLight,
} as { [name in RecordingSplitGroupName]: ColorClasses };
