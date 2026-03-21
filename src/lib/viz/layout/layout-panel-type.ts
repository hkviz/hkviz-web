import { ChartBarBigIcon, Map } from 'lucide-solid';
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

export type LayoutPanelTypeCategory = 'splits' | 'area-chart' | 'map-options' | 'area-analytics' | 'map';

export interface LayoutPanelTypeBase<TId extends string, TCategory extends LayoutPanelTypeCategory> {
	id: TId;
	category: TCategory;
	displayName: string;
	icon: Component<{ class?: string }>;
	showIconInSelect: boolean;
	intrinsicSize: number;
	maxSizeInRems?: number;
	selectableInSelect: boolean;
	collapsedSizeInRem: number;
}

export type LayoutPanelTypeAreaChart = LayoutPanelTypeBase<
	| 'area-chart-geo'
	| 'area-chart-grub'
	| 'area-chart-health'
	| 'area-chart-soul'
	| 'area-chart-completion'
	| 'area-chart-essence',
	'area-chart'
>;

export type LayoutPanelTypeSplits = LayoutPanelTypeBase<'splits', 'splits'>;
export type LayoutPanelTypeMapOptions = LayoutPanelTypeBase<'map-options', 'map-options'>;
export type LayoutPanelTypeRoomInfo = LayoutPanelTypeBase<'area-analytics', 'area-analytics'>;
export type LayoutPanelTypeMap = LayoutPanelTypeBase<'map', 'map'>;
export type LayoutPanelType =
	| LayoutPanelTypeAreaChart
	| LayoutPanelTypeSplits
	| LayoutPanelTypeMapOptions
	| LayoutPanelTypeRoomInfo
	| LayoutPanelTypeMap;

const DEFAULT_COLLAPSED_SIZE_IN_REM = 2.75;

export const layoutPanelTypes: LayoutPanelType[] = [
	{
		id: 'area-analytics',
		category: 'area-analytics',
		displayName: 'Area Analytics',
		icon: ChartBarBigIcon,
		showIconInSelect: false,
		intrinsicSize: 0.4,
		selectableInSelect: true,
		collapsedSizeInRem: 4.5,
	},
	{
		id: 'map-options',
		category: 'map-options',
		displayName: 'Map Options',
		icon: Map,
		showIconInSelect: false,
		intrinsicSize: 0.5,
		selectableInSelect: true,
		maxSizeInRems: 13.125,
		collapsedSizeInRem: DEFAULT_COLLAPSED_SIZE_IN_REM,
	},
	{
		id: 'map',
		category: 'map',
		displayName: 'Map',
		icon: Map,
		showIconInSelect: false,
		intrinsicSize: 0.7,
		selectableInSelect: false,
		collapsedSizeInRem: DEFAULT_COLLAPSED_SIZE_IN_REM,
	},
	{
		id: 'splits',
		category: 'splits',
		displayName: 'Splits',
		icon: SplitPanelIcon,
		showIconInSelect: false,
		intrinsicSize: 0.4,
		selectableInSelect: true,
		collapsedSizeInRem: DEFAULT_COLLAPSED_SIZE_IN_REM,
	},
	{
		id: 'area-chart-geo',
		category: 'area-chart',
		displayName: 'Geo',
		icon: GeoChartUnitIcon,
		showIconInSelect: true,
		intrinsicSize: 0.45,
		selectableInSelect: true,
		// maxSizeInRems: 29,
		collapsedSizeInRem: DEFAULT_COLLAPSED_SIZE_IN_REM,
	},
	{
		id: 'area-chart-grub',
		category: 'area-chart',
		displayName: 'Grub',
		icon: GrubChartUnitIcon,
		showIconInSelect: true,
		intrinsicSize: 0.35,
		selectableInSelect: true,
		// maxSizeInRems: 27,
		collapsedSizeInRem: DEFAULT_COLLAPSED_SIZE_IN_REM,
	},
	{
		id: 'area-chart-health',
		category: 'area-chart',
		displayName: 'Health',
		icon: HealthChartMaskUnitIcon,
		showIconInSelect: true,
		intrinsicSize: 0.35,
		selectableInSelect: true,
		// maxSizeInRems: 27,
		collapsedSizeInRem: DEFAULT_COLLAPSED_SIZE_IN_REM,
	},
	{
		id: 'area-chart-soul',
		category: 'area-chart',
		displayName: 'Soul',
		icon: SoulChartUnitIcon,
		showIconInSelect: true,
		intrinsicSize: 0.35,
		selectableInSelect: true,
		collapsedSizeInRem: DEFAULT_COLLAPSED_SIZE_IN_REM,
	},
	{
		id: 'area-chart-completion',
		category: 'area-chart',
		displayName: 'Completion',
		icon: CompletionChartUnitIcon,
		showIconInSelect: true,
		intrinsicSize: 0.25,
		selectableInSelect: true,
		collapsedSizeInRem: DEFAULT_COLLAPSED_SIZE_IN_REM,
	},
	{
		id: 'area-chart-essence',
		category: 'area-chart',
		displayName: 'Essence',
		icon: EssenceChartUnitIcon,
		showIconInSelect: true,
		intrinsicSize: 0.25,
		selectableInSelect: true,
		collapsedSizeInRem: DEFAULT_COLLAPSED_SIZE_IN_REM,
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
export const layoutPanelTypeIdsInSelect: LayoutPanelTypeId[] = layoutPanelTypes
	.filter((type) => type.selectableInSelect)
	.map((type) => type.id);
