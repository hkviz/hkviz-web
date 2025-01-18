import { type Component } from 'solid-js';
import { cn } from '~/lib/utils';
import { tailwindChartColors } from '../colors';
import { blueMaskImg, emptyMaskImg, maskImg, steelMaskImg } from '../img-urls';
import { ChartDocTitleIcon, ChartDocVars } from './chart-doc';
import { LineAreaChart, type LineChartVariableDescription } from './line-area-chart';
import { useGameplayStore } from '../store';

const MaskUnit: Component<{ class?: string }> = (props) => {
	const gameplayStore = useGameplayStore();
	const isSteelSoul = gameplayStore.isSteelSoul;
	return <img src={isSteelSoul() ? steelMaskImg : maskImg} class={props.class} alt="Mask" />;
};
const LifebloodUnit: Component<{ class?: string }> = (props) => {
	return <img src={blueMaskImg} class={cn(props.class, '-mx-1 w-7')} alt="Lifeblood" />;
};
const EmptyMaskUnit: Component<{ class?: string }> = (props) => {
	return <img src={emptyMaskImg} class={props.class} alt="Empty mask" />;
};

const variables: LineChartVariableDescription[] = [
	{
		key: 'health',
		name: 'Masks',
		description: 'The players health.',
		color: tailwindChartColors.slate,
		UnitIcon: MaskUnit,
		order: 1,
	},
	{
		key: 'healthBlue',
		name: 'Lifeblood masks',
		description: 'The players additional health from lifeblood masks.',
		color: tailwindChartColors.sky,
		UnitIcon: LifebloodUnit,
		order: 2,
	},
	{
		key: 'healthLost',
		name: 'Empty masks',
		description: 'The currently empty masks, which can be healed back up.',
		color: tailwindChartColors.light,
		UnitIcon: EmptyMaskUnit,
		order: 3,
		defaultHidden: true,
	},
];

export function HealthChart() {
	return (
		<LineAreaChart
			variables={variables}
			header={
				<>
					<MaskUnit class="mr-1 inline-block w-6" />
					Health
				</>
			}
			yAxisLabel="Masks"
			minimalMaximumY={5}
			downScaleMaxTimeDelta={100}
		/>
	);
}

export function HealthChartDocVars() {
	return <ChartDocVars variables={variables} />;
}

export function HealthChartDocIcon() {
	return <ChartDocTitleIcon unit={MaskUnit} />;
}
