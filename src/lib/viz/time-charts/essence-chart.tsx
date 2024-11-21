import { type Component } from 'solid-js';
import { cn } from '~/lib/utils';
import { tailwindChartColors } from '../colors';
import { dreamNailImg } from '../img-urls';
import { ChartDocTitleIcon, ChartDocVars } from './chart-doc';
import { LineAreaChart, type LineChartVariableDescription } from './line-area-chart';

const Unit: Component<{ class?: string }> = (props) => {
	return <img src={dreamNailImg} class={cn('drop-shadow-glow-sm', props.class)} alt="Dream nail" />;
};
// function Unit({ className }: { className?: string }) {
//     return <span className={className}>%</span>;
// }
const variables: LineChartVariableDescription[] = [
	{
		key: 'dreamOrbs',
		name: 'Essence',
		description: 'Essence collected',
		color: tailwindChartColors.orange,
		UnitIcon: Unit,
		order: 1,
	},
];

export function EssenceChart() {
	return (
		<LineAreaChart
			variables={variables}
			header={
				<>
					<Unit class="mr-1 inline-block w-6" />
					Essence
				</>
			}
			yAxisLabel="Essence"
			minimalMaximumY={10}
			downScaleMaxTimeDelta={100}
		/>
	);
}

export function EssenceChartDocVars() {
	return <ChartDocVars variables={variables} />;
}

export function EssenceChartDocIcon() {
	return <ChartDocTitleIcon unit={Unit} />;
}
