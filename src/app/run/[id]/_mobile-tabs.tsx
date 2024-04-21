import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSignals } from '@preact/signals-react/runtime';
import { AreaChart, BadgeInfo, Map, Timer, type LucideIcon } from 'lucide-react';
import { uiStore, type MobileTab } from '~/lib/stores/ui-store';

function MobileTabTrigger({ value, title, icon: Icon }: { value: MobileTab; title: string; icon: LucideIcon }) {
    return (
        <TabsTrigger
            value={value}
            className="group flex h-14 max-w-28 shrink grow flex-col items-center justify-center rounded-none"
        >
            <Icon className="h-5 w-5 transition group-data-[state=active]:scale-110" />
            <span className="text-sm transition group-data-[state=active]:translate-y-0.5">{title}</span>
        </TabsTrigger>
    );
}

export function MobileTabBar() {
    useSignals();
    const mobileTab = uiStore.mobileTab.value;
    return (
        <Tabs
            className="dashboard-grid-tabs sticky bottom-0 left-0 right-0 z-10 lg:hidden"
            value={mobileTab}
            onValueChange={(tab: string) => {
                uiStore.activateTab(tab as MobileTab);
            }}
        >
            <TabsList className="flex h-14 w-full flex-row rounded-none border-t">
                <MobileTabTrigger value="overview" title="Overview" icon={BadgeInfo} />
                <MobileTabTrigger value="map" title="Map" icon={Map} />
                <MobileTabTrigger value="time-charts" title="Charts" icon={AreaChart} />
                <MobileTabTrigger value="splits" title="Splits" icon={Timer} />
            </TabsList>
        </Tabs>
    );
}
