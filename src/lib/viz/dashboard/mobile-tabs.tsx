import { AreaChart, BadgeInfo, Map, Timer, type LucideIcon } from 'lucide-solid';
import { type Component } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { MobileTab, useUiStore } from '../store';
import { cn } from '~/lib/utils';

interface MobileTabTriggerProps {
	value: MobileTab;
	title: string;
	icon: LucideIcon;
	class?: string;
}

const MobileTabTrigger: Component<MobileTabTriggerProps> = (props) => {
	return (
		<TabsTrigger
			value={props.value}
			class={cn(
				'group flex h-12 max-w-28 shrink grow flex-col items-center justify-center rounded-none',
				props.class,
			)}
		>
			<Dynamic component={props.icon} class="h-4 w-4 transition group-data-[state=active]:scale-110" />
			<span class="text-sm transition group-data-[state=active]:translate-y-0.5">{props.title}</span>
		</TabsTrigger>
	);
};

export const MobileTabBar: Component = () => {
	const uiStore = useUiStore();
	const mobileTab = uiStore.mobileTab;
	return (
		<Tabs
			class="dashboard-grid-tabs sticky z-10 lg:hidden"
			value={mobileTab()}
			onChange={(tab: string) => {
				uiStore.activateTab(tab as MobileTab);
			}}
		>
			<TabsList class="flex h-12 w-full flex-row rounded-none border-t">
				<MobileTabTrigger value="overview" title="Overview" icon={BadgeInfo} />
				<MobileTabTrigger value="map" title="Map" icon={Map} class="map-tab-mobile-layout" />
				<MobileTabTrigger
					value="time-charts"
					title="Charts"
					icon={AreaChart}
					class="time-chart-tab-mobile-layout"
				/>
				<MobileTabTrigger value="splits" title="Splits" icon={Timer} class="splits-tab-mobile-layout" />
			</TabsList>
		</Tabs>
	);
};
