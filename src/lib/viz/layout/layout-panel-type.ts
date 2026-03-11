import { Component } from 'solid-js';
import { SplitIcon as SplitPanelIcon } from '../splits/split-icon';
import {
	CompletionChartUnitIcon,
	EssenceChartUnitIcon,
	GeoChartUnitIcon,
	GrubChartUnitIcon,
	HealthChartMaskUnitIcon,
	SoulChartUnitIcon,
} from '../time-charts/chart-icons';

export type LayoutPanelTypeCategory = 'splits' | 'area-chart';

export interface LayoutPanelTypeAreaChart {
	id:
		| 'area-chart-geo'
		| 'area-chart-grub'
		| 'area-chart-health'
		| 'area-chart-soul'
		| 'area-chart-completion'
		| 'area-chart-essence';
	category: 'area-chart';
	displayName: string;
	icon: Component<{ class?: string }>;
	showIconInSelect: boolean;
	intrinsicSize: number;
}

export interface LayoutPanelTypeSplits {
	id: 'splits';
	category: 'splits';
	displayName: string;
	icon: Component<{ class?: string }>;
	showIconInSelect: boolean;
	intrinsicSize: number;
}

export type LayoutPanelType = LayoutPanelTypeAreaChart | LayoutPanelTypeSplits;

export const layoutPanelTypes: LayoutPanelType[] = [
	{
		id: 'splits',
		category: 'splits',
		displayName: 'Splits',
		icon: SplitPanelIcon,
		showIconInSelect: false,
		intrinsicSize: 0.4,
	},
	{
		id: 'area-chart-geo',
		category: 'area-chart',
		displayName: 'Geo',
		icon: GeoChartUnitIcon,
		showIconInSelect: true,
		intrinsicSize: 0.45,
	},
	{
		id: 'area-chart-grub',
		category: 'area-chart',
		displayName: 'Grub',
		icon: GrubChartUnitIcon,
		showIconInSelect: true,
		intrinsicSize: 0.35,
	},
	{
		id: 'area-chart-health',
		category: 'area-chart',
		displayName: 'Health',
		icon: HealthChartMaskUnitIcon,
		showIconInSelect: true,
		intrinsicSize: 0.35,
	},
	{
		id: 'area-chart-soul',
		category: 'area-chart',
		displayName: 'Soul',
		icon: SoulChartUnitIcon,
		showIconInSelect: true,
		intrinsicSize: 0.35,
	},
	{
		id: 'area-chart-completion',
		category: 'area-chart',
		displayName: 'Completion',
		icon: CompletionChartUnitIcon,
		showIconInSelect: true,
		intrinsicSize: 0.25,
	},
	{
		id: 'area-chart-essence',
		category: 'area-chart',
		displayName: 'Essence',
		icon: EssenceChartUnitIcon,
		showIconInSelect: true,
		intrinsicSize: 0.25,
	},
];

export const LayoutPanelTypeById: Record<LayoutPanelType['id'], LayoutPanelType> = Object.fromEntries(
	layoutPanelTypes.map((type) => [type.id, type]),
) as Record<LayoutPanelType['id'], LayoutPanelType>;

export type LayoutPanelTypeId = LayoutPanelType['id'];

export function getLayoutPanelTypeById(id: LayoutPanelTypeId): LayoutPanelType {
	return LayoutPanelTypeById[id];
}

export const layoutPanelTypeIds: LayoutPanelTypeId[] = layoutPanelTypes.map((type) => type.id);
