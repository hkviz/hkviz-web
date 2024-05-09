import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { MobileTab } from '@hkviz/viz';
import { useSignals } from '@preact/signals-react/runtime';
import { AreaChart, BadgeInfo, Map, Timer, type LucideIcon } from 'lucide-react';
import { uiStore } from '~/lib/stores/ui-store';

function MobileTabTrigger({
    value,
    title,
    icon: Icon,
    className,
}: {
    value: MobileTab;
    title: string;
    icon: LucideIcon;
    className?: string;
}) {
    return (
        <TabsTrigger
            value={value}
            className={cn(
                'group flex h-12 max-w-28 shrink grow flex-col items-center justify-center rounded-none',
                className,
            )}
        >
            <Icon className="h-4 w-4 transition group-data-[state=active]:scale-110" />
            <span className="text-sm transition group-data-[state=active]:translate-y-0.5">{title}</span>
        </TabsTrigger>
    );
}

export function MobileTabBar() {
    useSignals();
    const mobileTab = uiStore.mobileTab.valuePreact;
    return (
        <Tabs
            className="dashboard-grid-tabs sticky z-10 lg:hidden"
            value={mobileTab}
            onValueChange={(tab: string) => {
                uiStore.activateTab(tab as MobileTab);
            }}
        >
            <TabsList className="flex h-12 w-full flex-row rounded-none border-t">
                <MobileTabTrigger value="overview" title="Overview" icon={BadgeInfo} />
                <MobileTabTrigger value="map" title="Map" icon={Map} className="map-tab-mobile-layout" />
                <MobileTabTrigger
                    value="time-charts"
                    title="Charts"
                    icon={AreaChart}
                    className="time-chart-tab-mobile-layout"
                />
                <MobileTabTrigger value="splits" title="Splits" icon={Timer} className="splits-tab-mobile-layout" />
            </TabsList>
        </Tabs>
    );
}
