import { Component, JSXElement } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { assertNever } from '~/lib/parser';
import { AreaAnalyticsPanel } from '../area-analytics';
import { MapView } from '../map';
import { MapOptions } from '../map-options';
import { RunSplits } from '../splits';
import { useLayoutStore } from '../store/layout-store';
import { CompletionChart, EssenceChart, GeoChart, GrubChart, HealthChart, SoulChart } from '../time-charts';
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

function getComponentForPanelType(type: LayoutPanelType): Component<LayoutPanelTypeProps> {
	switch (type.id) {
		case 'area-chart-completion':
			return CompletionChart;
		case 'area-chart-essence':
			return EssenceChart;
		case 'area-chart-geo':
			return GeoChart;
		case 'area-chart-grub':
			return GrubChart;
		case 'area-chart-health':
			return HealthChart;
		case 'area-chart-soul':
			return SoulChart;
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
		default:
			assertNever(type);
	}
}

export const LayoutPanel: Component<LayoutPanelProps> = (props) => {
	const layoutStore = useLayoutStore();
	const panelContext = createLayoutPanelContext({
		layoutStore,
		layoutLane: () => props.layoutLane,
		layoutLaneIndex: () => props.layoutLaneIndex,
	});
	const PanelComponent = () => getComponentForPanelType(panelContext.type());

	return (
		<LayoutPanelContext.Provider value={panelContext}>
			<Dynamic component={PanelComponent()} resizeOptions={props.resizeOptions} />
		</LayoutPanelContext.Provider>
	);
};
