import { type Component } from 'solid-js';
import { tailwindChartColors } from '../colors';
import { grubImage } from '../img-urls';
import { ChartDocTitleIcon, ChartDocVars } from './chart-doc';
import { LineAreaChart, type LineChartVariableDescription } from './line-area-chart';

const Unit: Component<{ class?: string }> = (props) => {
	return <img src={grubImage} class={props.class} alt="Geo" />;
};

const variables: LineChartVariableDescription[] = [
	{
		key: 'grubsNoRewardCollected',
		name: 'Grubs freed, reward not collected',
		description:
			'These grubs have already been freed from their glass jars, going to the grub father will reward you for freeing them.',
		color: tailwindChartColors.amberLight,
		UnitIcon: Unit,
		order: 2,
	},
	{
		key: 'grubRewards',
		name: 'Grubs freed, reward collected',
		description:
			'These grubs have already been freed from their glass jars and the reward from grub father has been collected as well.',
		color: tailwindChartColors.green,
		UnitIcon: Unit,
		order: 1,
	},
	{
		key: 'grubsCollected',
		name: 'Total',
		description: 'Total number of grubs freed from their glass jars.',
		color: tailwindChartColors.slate,
		UnitIcon: Unit,
		order: 1,
		notShownInGraph: true,
	},
];

export function GrubChart() {
	return (
		<LineAreaChart
			variables={variables}
			header={
				<>
					<Unit class="mr-1 inline-block w-6" />
					Grubs
				</>
			}
			yAxisLabel="Grubs"
			minimalMaximumY={1}
			downScaleMaxTimeDelta={100}
		/>
	);
}

export function GrubsChartDocVars() {
	return <ChartDocVars variables={variables} />;
}

export function GrubsChartDocIcon() {
	return <ChartDocTitleIcon unit={Unit} />;
}
