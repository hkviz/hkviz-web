import { type Component } from 'solid-js';
import { ChartDocTitleIcon, ChartDocVars } from './chart-doc';
import { LineAreaChart, type LineChartVariableDescription } from './line-area-chart';
import { vesselImg } from '../img-urls';
import { tailwindChartColors } from '../colors';

const Unit: Component<{ class?: string }> = (props) => {
	return <img src={vesselImg} class={props.class} alt="Soul" />;
};

const variables: LineChartVariableDescription[] = [
	{
		key: 'MPCharge',
		name: 'Soul',
		description: 'How much soul is in the soul meter (from 0 to 99). Healing and spells use 33 soul per use.',
		color: tailwindChartColors.slate,
		UnitIcon: Unit,
		order: 1,
	},
	{
		key: 'MPReserve',
		name: 'Soul reserve',
		description: 'Soul inside the soul vessels (up to 33 per vessel).',
		color: tailwindChartColors.indigo,
		UnitIcon: Unit,
		order: 2,
	},
	{
		key: 'MPTotal',
		name: 'Total',
		description: 'Total soul in soul meter and reserve.',
		color: tailwindChartColors.slate,
		UnitIcon: Unit,
		order: 3,
		notShownInGraph: true,
	},
];

export function SoulChart() {
	return (
		<LineAreaChart
			variables={variables}
			header={
				<>
					<Unit class="mr-1 inline-block w-6" />
					Soul
				</>
			}
			yAxisLabel="Soul"
			minimalMaximumY={99}
			downScaleMaxTimeDelta={100}
		/>
	);
}

export function SoulChartDocVars() {
	return <ChartDocVars variables={variables} />;
}

export function SoulChartDocIcon() {
	return <ChartDocTitleIcon unit={Unit} />;
}
