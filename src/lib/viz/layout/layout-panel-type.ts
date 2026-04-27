import { ChartBarBigIcon, MapIcon } from 'lucide-solid';
import { Component } from 'solid-js';
import { GameId, gameIds } from '~/lib/types/game-ids';
import { SplitIcon as SplitPanelIcon } from '../splits/split-icon';
import { localized, LocalizedString } from '../store/localization-store';
import {
	CompletionChartUnitIcon,
	EssenceChartUnitIconHollow,
	GeoChartUnitIconHollow,
	GrubChartUnitIconHollow,
	HealthChartMaskUnitIconHollow,
	HealthChartMaskUnitIconSilk,
	RosaryChartUnitIconSilk,
	ShellShardUnitIconSilk,
	SoulChartUnitIconHollow,
} from '../time-charts/chart-icons';

export type LayoutPanelTypeCategory = 'splits' | 'area-chart' | 'map-options' | 'area-analytics' | 'map' | 'empty';

export interface LayoutPanelTypeBase<TId extends string, TCategory extends LayoutPanelTypeCategory> {
	id: TId;
	category: TCategory;
	displayName: LocalizedString;
	icon: Component<{ class?: string }>;
	showIconInSelect: boolean;
	intrinsicSize: number;
	maxSizeInRems?: number;
	selectableInSelect: boolean;
	collapsedSizeInRem: number;
	games: GameId[];
}

export type LayoutPanelTypeAreaChart = LayoutPanelTypeBase<
	| 'area-chart-geo-hollow'
	| 'area-chart-geo-silk'
	| 'area-chart-grub-hollow'
	| 'area-chart-health-hollow'
	| 'area-chart-health-silk'
	| 'area-chart-soul-hollow'
	| 'area-chart-completion-hollow'
	| 'area-chart-essence-hollow'
	| 'area-chart-shell-shards-silk',
	'area-chart'
>;

export type LayoutPanelTypeSplits = LayoutPanelTypeBase<'splits', 'splits'>;
export type LayoutPanelTypeMapOptions = LayoutPanelTypeBase<'map-options', 'map-options'>;
export type LayoutPanelTypeRoomInfo = LayoutPanelTypeBase<'area-analytics', 'area-analytics'>;
export type LayoutPanelTypeMap = LayoutPanelTypeBase<'map', 'map'>;
export type LayoutPanelTypeEmpty = LayoutPanelTypeBase<'empty', 'empty'>;
export type LayoutPanelType =
	| LayoutPanelTypeAreaChart
	| LayoutPanelTypeSplits
	| LayoutPanelTypeMapOptions
	| LayoutPanelTypeRoomInfo
	| LayoutPanelTypeMap
	| LayoutPanelTypeEmpty;

const DEFAULT_COLLAPSED_SIZE_IN_REM = 2.75;

export const layoutPanelTypes: LayoutPanelType[] = [
	{
		id: 'area-analytics',
		category: 'area-analytics',
		displayName: localized.raw('Area Analytics'),
		icon: ChartBarBigIcon,
		showIconInSelect: false,
		intrinsicSize: 0.4,
		selectableInSelect: true,
		collapsedSizeInRem: 4.5,
		games: ['hollow', 'silk'],
	},
	{
		id: 'map-options',
		category: 'map-options',
		displayName: localized.raw('Map Options'),
		icon: MapIcon,
		showIconInSelect: false,
		intrinsicSize: 0.5,
		selectableInSelect: true,
		maxSizeInRems: 13.125,
		collapsedSizeInRem: DEFAULT_COLLAPSED_SIZE_IN_REM,
		games: ['hollow', 'silk'],
	},
	{
		id: 'map',
		category: 'map',
		displayName: localized.raw('Map'),
		icon: MapIcon,
		showIconInSelect: false,
		intrinsicSize: 0.7,
		selectableInSelect: false,
		collapsedSizeInRem: DEFAULT_COLLAPSED_SIZE_IN_REM,
		games: ['hollow', 'silk'],
	},
	{
		id: 'splits',
		category: 'splits',
		displayName: localized.raw('Splits'),
		icon: SplitPanelIcon,
		showIconInSelect: false,
		intrinsicSize: 0.4,
		selectableInSelect: true,
		collapsedSizeInRem: DEFAULT_COLLAPSED_SIZE_IN_REM,
		games: ['hollow', 'silk'],
	},
	{
		id: 'area-chart-geo-hollow',
		category: 'area-chart',
		displayName: localized.raw('Geo'),
		icon: GeoChartUnitIconHollow,
		showIconInSelect: true,
		intrinsicSize: 0.45,
		selectableInSelect: true,
		// maxSizeInRems: 29,
		collapsedSizeInRem: DEFAULT_COLLAPSED_SIZE_IN_REM,
		games: ['hollow'],
	},
	{
		id: 'area-chart-geo-silk',
		category: 'area-chart',
		displayName: localized.silk('UI.INV_NAME_COIN'),
		icon: RosaryChartUnitIconSilk,
		showIconInSelect: true,
		intrinsicSize: 0.45,
		selectableInSelect: true,
		// maxSizeInRems: 29,
		collapsedSizeInRem: DEFAULT_COLLAPSED_SIZE_IN_REM,
		games: ['silk'],
	},
	{
		id: 'area-chart-grub-hollow',
		category: 'area-chart',
		displayName: localized.raw('Grub'),
		icon: GrubChartUnitIconHollow,
		showIconInSelect: true,
		intrinsicSize: 0.35,
		selectableInSelect: true,
		// maxSizeInRems: 27,
		collapsedSizeInRem: DEFAULT_COLLAPSED_SIZE_IN_REM,
		games: ['hollow'],
	},
	{
		id: 'area-chart-health-hollow',
		category: 'area-chart',
		displayName: localized.raw('Health'),
		icon: HealthChartMaskUnitIconHollow,
		showIconInSelect: true,
		intrinsicSize: 0.35,
		selectableInSelect: true,
		// maxSizeInRems: 27,
		collapsedSizeInRem: DEFAULT_COLLAPSED_SIZE_IN_REM,
		games: ['hollow'],
	},
	{
		id: 'area-chart-health-silk',
		category: 'area-chart',
		displayName: localized.raw('Health'),
		icon: HealthChartMaskUnitIconSilk,
		showIconInSelect: true,
		intrinsicSize: 0.35,
		selectableInSelect: true,
		// maxSizeInRems: 27,
		collapsedSizeInRem: DEFAULT_COLLAPSED_SIZE_IN_REM,
		games: ['silk'],
	},
	{
		id: 'area-chart-soul-hollow',
		category: 'area-chart',
		displayName: localized.raw('Soul'),
		icon: SoulChartUnitIconHollow,
		showIconInSelect: true,
		intrinsicSize: 0.35,
		selectableInSelect: true,
		collapsedSizeInRem: DEFAULT_COLLAPSED_SIZE_IN_REM,
		games: ['hollow'],
	},
	{
		id: 'area-chart-completion-hollow',
		category: 'area-chart',
		displayName: localized.raw('Completion'),
		icon: CompletionChartUnitIcon,
		showIconInSelect: true,
		intrinsicSize: 0.25,
		selectableInSelect: true,
		collapsedSizeInRem: DEFAULT_COLLAPSED_SIZE_IN_REM,
		games: ['hollow'],
	},
	{
		id: 'area-chart-essence-hollow',
		category: 'area-chart',
		displayName: localized.raw('Essence'),
		icon: EssenceChartUnitIconHollow,
		showIconInSelect: true,
		intrinsicSize: 0.25,
		selectableInSelect: true,
		collapsedSizeInRem: DEFAULT_COLLAPSED_SIZE_IN_REM,
		games: ['hollow'],
	},
	{
		id: 'area-chart-shell-shards-silk',
		category: 'area-chart',
		displayName: localized.silk('UI.INV_NAME_SHARD'),
		icon: ShellShardUnitIconSilk,
		showIconInSelect: true,
		intrinsicSize: 0.25,
		selectableInSelect: true,
		collapsedSizeInRem: DEFAULT_COLLAPSED_SIZE_IN_REM,
		games: ['silk'],
	},
	{
		id: 'empty',
		category: 'empty',
		displayName: localized.raw('Empty'),
		icon: ChartBarBigIcon,
		showIconInSelect: false,
		intrinsicSize: 0.25,
		selectableInSelect: false,
		collapsedSizeInRem: DEFAULT_COLLAPSED_SIZE_IN_REM,
		games: ['hollow', 'silk'],
	},
];

export const layoutPanelTypesByGame: Record<GameId, LayoutPanelType[]> = Object.fromEntries(
	gameIds.map((game) => [game, layoutPanelTypes.filter((type) => type.games.includes(game as GameId))]),
) as Record<GameId, LayoutPanelType[]>;

export const LayoutPanelTypeById: Record<LayoutPanelType['id'], LayoutPanelType> = Object.fromEntries(
	layoutPanelTypes.map((type) => [type.id, type]),
) as Record<LayoutPanelType['id'], LayoutPanelType>;

export type LayoutPanelTypeId = LayoutPanelType['id'];

export function getLayoutPanelTypeById(id: LayoutPanelTypeId): LayoutPanelType {
	return LayoutPanelTypeById[id];
}

export const layoutPanelTypeIds: LayoutPanelTypeId[] = layoutPanelTypes.map((type) => type.id);
