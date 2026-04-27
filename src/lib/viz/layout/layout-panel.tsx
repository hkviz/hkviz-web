import { Component, JSXElement, Show } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { assertNever } from '~/lib/parser';
import { GameId } from '~/lib/types/game-ids';
import { AreaAnalyticsPanel } from '../area-analytics';
import { MapView } from '../map';
import { MapOptions } from '../map-options';
import { RunSplits } from '../splits/splits';
import { useGameplayStore } from '../store/gameplay-store';
import { useLayoutStore } from '../store/layout-store';
import {
	CompletionChartHollow,
	EssenceChartHollow,
	GeoChartHollow,
	GrubChartHollow,
	HealthChartHollow,
	SoulChartHollow,
} from '../time-charts';
import { GeoChartSilk } from '../time-charts/area-charts-silk/geo-chart-silk';
import { HealthChartSilk } from '../time-charts/area-charts-silk/health-chart-silk';
import { ShellShardChartSilk } from '../time-charts/area-charts-silk/shell-shard-chart-silk';
import { LaneId } from './layout-location';
import { LayoutPanelContext } from './layout-panel-context';
import { createLayoutPanelContext } from './layout-panel-context-create';
import { LayoutPanelTypeProps } from './layout-panel-props';
import { LayoutPanelType } from './layout-panel-type';
import { LayoutPanelWrapper } from './layout-panel-wrapper';

export interface LayoutPanelProps {
	layoutLane: LaneId;
	layoutLaneIndex: number;
	resizeOptions?: JSXElement;
	maxSize?: number;
}

function PlaceholderPanelType() {
	return (
		<LayoutPanelWrapper class="relative">
			<div />
		</LayoutPanelWrapper>
	);
}

function getComponentForPanelType(game: GameId | null, type: LayoutPanelType): Component<LayoutPanelTypeProps> {
	switch (type.id) {
		// hollow
		case 'area-chart-completion-hollow':
			return CompletionChartHollow;
		case 'area-chart-essence-hollow':
			return EssenceChartHollow;
		case 'area-chart-geo-hollow':
			return GeoChartHollow;
		case 'area-chart-grub-hollow':
			return GrubChartHollow;
		case 'area-chart-health-hollow':
			return HealthChartHollow;
		case 'area-chart-soul-hollow':
			return SoulChartHollow;

		// silk
		case 'area-chart-geo-silk':
			return GeoChartSilk;
		case 'area-chart-health-silk':
			return HealthChartSilk;
		case 'area-chart-shell-shards-silk':
			return ShellShardChartSilk;

		// shared
		case 'splits':
			return RunSplits;
		case 'map-options':
			return MapOptions;
		case 'area-analytics':
			return AreaAnalyticsPanel;
		case 'map':
			return (props) => (
				<LayoutPanelWrapper class="relative">
					<MapView class="absolute inset-0" {...props} />
				</LayoutPanelWrapper>
			);
		case 'empty':
			return PlaceholderPanelType;
		default:
			return assertNever(type);
	}
}

export const LayoutPanel: Component<LayoutPanelProps> = (props) => {
	const layoutStore = useLayoutStore();
	const gameplayStore = useGameplayStore();
	const panelContext = createLayoutPanelContext({
		layoutStore,
		layoutLane: () => props.layoutLane,
		layoutLaneIndex: () => props.layoutLaneIndex,
	});
	const PanelComponent = () => {
		return getComponentForPanelType(gameplayStore.game(), panelContext.type());
	};

	return (
		<LayoutPanelContext.Provider value={panelContext}>
			<Show when={PanelComponent()}>
				{(PanelComponent) => <Dynamic component={PanelComponent()} resizeOptions={props.resizeOptions} />}
			</Show>
		</LayoutPanelContext.Provider>
	);
};
