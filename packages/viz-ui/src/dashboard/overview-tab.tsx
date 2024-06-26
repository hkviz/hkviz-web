import { Button, Expander, Progress, Table, TableBody, TableCell, TableHead, TableRow, cn } from '@hkviz/components';
import { playerDataFields } from '@hkviz/parser';
import {
    animationStore,
    extraChartStore,
    gameplayStore,
    mapZoomStore,
    roomColoringStore,
    roomDisplayStore,
    tourStore,
    traceStore,
    uiStore,
} from '@hkviz/viz';
import { AreaChart, Play, Rocket } from 'lucide-solid';
import { For, Show, createEffect, createMemo, type Component } from 'solid-js';
import { RelativeDate } from '../datetime/date';

export interface RunOverviewTabProps {
    class?: string;
    startDate: Date | undefined;
    loadingProgress: number;
    loadingDone: boolean;
    onRunCardWrapperReady: (element: HTMLDivElement) => void;
}

export const RunOverviewTab: Component<RunOverviewTabProps> = (props) => {
    const runCardWrapper = (<div />) as HTMLDivElement;
    createEffect(() => {
        props.onRunCardWrapperReady(runCardWrapper);
    });

    const mainCardTab = uiStore.mainCardTab;
    const recording = gameplayStore.recording;

    const isOpen = () => mainCardTab() === 'overview';

    function viewAnimatedAnalytics() {
        uiStore.activateTab('map');
        animationStore.setIsPlaying(true);
        roomDisplayStore.setRoomVisibility('visited-animated');
        traceStore.setVisibility('animated');
        roomColoringStore.setRoomColorMode('area');
        extraChartStore.setFollowsAnimationAutoBounds(true);
        mapZoomStore.setEnabled(true);
        mapZoomStore.setTarget('current-zone');
    }

    function viewStaticAnalytics() {
        uiStore.activateTab('map');
        animationStore.setIsPlaying(false);
        roomDisplayStore.setRoomVisibility('visited');
        roomColoringStore.setRoomColorMode('1-var');
        if (roomColoringStore.var1() !== 'firstVisitMs') {
            roomColoringStore.cycleRoomColorVar1('firstVisitMs');
        }
        extraChartStore.setFollowsAnimationAutoBounds(false);
        mapZoomStore.setEnabled(true);
        mapZoomStore.setTarget('visible-rooms');
    }

    const fiteredModVersions = createMemo(() => {
        return recording()?.allModVersions?.filter(() => false); // (mod) => mod.name === 'HKViz');
    });

    const hollowKnightVersions = createMemo(() => {
        return [
            ...new Set(
                recording()
                    ?.allPlayerDataEventsOfField(playerDataFields.byFieldName.version)
                    ?.map((event) => event.value),
            ),
        ];
    });

    const isDisabled = () => !recording();

    return (
        <div
            class={cn(
                'flex items-center justify-center transition',
                isOpen() ? 'visible backdrop-blur-md' : 'pointer-events-none invisible backdrop-blur-none',
                props.class,
            )}
        >
            <div class={cn('bg-card absolute inset-0', isOpen() ? 'opacity-75' : 'opacity-0')} />
            <div
                class={cn(
                    'relative z-10 max-h-full w-full overflow-y-auto transition',
                    isOpen() ? '' : 'scale-75 opacity-0',
                )}
            >
                <div class="mx-auto flex min-h-full w-full max-w-[700px] flex-col items-center justify-center gap-4 px-4 pb-12 pt-[max(12vh,3rem)]">
                    <Expander expanded={!props.loadingDone}>
                        <Progress
                            value={props.loadingProgress * 99 + 1}
                            minValue={0}
                            maxValue={100}
                            getValueLabel={({ value, max }) => `${value} of ${max} tasks completed`}
                            class="w-[300px] space-y-1"
                        />
                    </Expander>
                    <div class="w-full">{runCardWrapper}</div>
                    <div class="flex flex-col items-center justify-center gap-2">
                        <div class="">
                            {/* <Button variant="secondary" asChild>
                                <a href="/guide/analytics" target="_blank">
                                    <HelpCircle size={20} class="mr-2 h-5 w-5" />
                                    View analytics guide
                                </a>
                            </Button> */}
                            <Button
                                onClick={tourStore.startTour}
                                disabled={isDisabled()}
                                class="getting-started-tour-button"
                            >
                                <Rocket class="mr-2 h-5 w-5" />
                                <span class="grow">Quick start tour</span>
                            </Button>
                        </div>
                        <div class="grid max-w-[500px] grid-cols-2 gap-2">
                            <Button onClick={viewAnimatedAnalytics} disabled={isDisabled()} variant="outline">
                                <Play class="mr-2 h-5 w-5" />
                                <span class="grow">View player movement</span>
                            </Button>
                            <Button onClick={viewStaticAnalytics} disabled={isDisabled()} variant="outline">
                                <AreaChart size={20} class="mr-2 h-5 w-5" />
                                View room based analytics
                            </Button>
                        </div>
                    </div>
                    <div>
                        <Expander expanded={!!recording()}>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableHead>Gameplay started</TableHead>
                                        <TableCell>
                                            <Show when={props.startDate} fallback={'Unknown'}>
                                                {(startedAt) => <RelativeDate date={startedAt()} />}
                                            </Show>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableHead>Hollow Knight version</TableHead>
                                        <TableCell>
                                            <Show when={hollowKnightVersions()}>
                                                {(hollowKnightVersions) => (
                                                    <For each={hollowKnightVersions()}>
                                                        {(it) => <span class="block">{it}</span>}
                                                    </For>
                                                )}
                                            </Show>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableHead>HKViz mod version</TableHead>
                                        <TableCell>
                                            <For each={recording()?.allHkVizModVersions}>
                                                {(it) => <span class="block">{it}</span>}
                                            </For>
                                        </TableCell>
                                    </TableRow>
                                    {
                                        <For each={fiteredModVersions()}>
                                            {(mod) => (
                                                <TableRow>
                                                    <TableHead>{mod.name} version</TableHead>
                                                    <TableCell>
                                                        <For each={mod.versions}>
                                                            {(it) => <span class="block">{it}</span>}
                                                        </For>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </For>
                                    }
                                </TableBody>
                            </Table>
                        </Expander>
                    </div>
                </div>
            </div>
        </div>
    );
};
