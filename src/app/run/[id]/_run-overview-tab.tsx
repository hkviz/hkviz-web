import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useSignals } from '@preact/signals-react/runtime';
import { AreaChart, HelpCircle, Play } from 'lucide-react';
import { type Session } from 'next-auth';
import { useMemo } from 'react';
import { RelativeDate } from '~/app/_components/date';
import { Expander } from '~/app/_components/expander';
import { RunCard } from '~/app/_components/run-card';
import { animationStore } from '~/lib/stores/animation-store';
import { extraChartStore } from '~/lib/stores/extra-chart-store';
import { gameplayStore } from '~/lib/stores/gameplay-store';
import { mapZoomStore } from '~/lib/stores/map-zoom-store';
import { roomColoringStore } from '~/lib/stores/room-coloring-store';
import { roomDisplayStore } from '~/lib/stores/room-display-store';
import { traceStore } from '~/lib/stores/trace-store';
import { uiStore } from '~/lib/stores/ui-store';
import { playerDataFields } from '~/lib/viz/player-data/player-data';
import { type GetRunResult } from '~/server/api/routers/run/run-get';

export function RunOverviewTab({
    runData,
    session,
    className,
}: {
    runData: GetRunResult;
    session: Session | null;
    className?: string;
}) {
    useSignals();
    const isOwnRun = session?.user?.id === runData.user.id;

    const mainCardTab = uiStore.mainCardTab.value;
    const recording = gameplayStore.recording.value;

    const isOpen = mainCardTab === 'overview';

    function viewAnimatedAnalytics() {
        uiStore.activateTab('map');
        animationStore.setIsPlaying(true);
        roomDisplayStore.roomVisibility.value = 'visited-animated';
        traceStore.visibility.value = 'animated';
        roomColoringStore.setRoomColorMode('area');
        extraChartStore.setFollowsAnimationAutoBounds(true);
        mapZoomStore.enabled.value = true;
        mapZoomStore.target.value = 'current-zone';
    }

    function viewStaticAnalytics() {
        uiStore.activateTab('map');
        animationStore.setIsPlaying(false);
        roomDisplayStore.roomVisibility.value = 'visited';
        roomColoringStore.setRoomColorMode('1-var');
        if (roomColoringStore.var1.value !== 'firstVisitMs') {
            roomColoringStore.cycleRoomColorVar1('firstVisitMs');
        }
        extraChartStore.setFollowsAnimationAutoBounds(false);
        mapZoomStore.enabled.value = true;
        mapZoomStore.target.value = 'visible-rooms';
    }

    const fiteredModVersions = useMemo(() => {
        return recording?.allModVersions?.filter(() => false); // (mod) => mod.name === 'HKViz');
    }, [recording?.allModVersions]);

    const hollowKnightVersions = useMemo(() => {
        return [
            ...new Set(
                recording
                    ?.allPlayerDataEventsOfField(playerDataFields.byFieldName.version)
                    ?.map((event) => event.value),
            ),
        ];
    }, [recording]);

    const isDisabled = !recording;

    return (
        <div
            className={cn(
                'flex items-center justify-center transition',
                isOpen ? 'visible backdrop-blur-md' : 'pointer-events-none invisible backdrop-blur-none',
                className,
            )}
        >
            <div className={cn('absolute inset-0 bg-card', isOpen ? 'opacity-75' : 'opacity-0')} />
            <div
                className={cn(
                    'relative z-10 max-h-full w-full overflow-y-auto transition',
                    isOpen ? '' : 'scale-75 opacity-0',
                )}
            >
                <div className="flex min-h-full w-full max-w-[700px] flex-col items-center justify-center gap-4 mx-auto">
                    <div className="w-full">
                        <RunCard run={runData} isOwnRun={isOwnRun} />
                    </div>
                    <div className="flex flex-col items-center justify-center gap-2">
                        <div className="grid max-w-[500px] grid-cols-2 gap-2">
                            <Button onClick={viewAnimatedAnalytics} disabled={isDisabled}>
                                <Play className="mr-2 h-5 w-5" />
                                <span className="grow">View player movement</span>
                            </Button>
                            <Button onClick={viewStaticAnalytics} disabled={isDisabled}>
                                <AreaChart size={20} className="mr-2 h-5 w-5" />
                                View room based analytics
                            </Button>
                        </div>
                        <div className="">
                            <Button variant="secondary" asChild>
                                <a href="/guide/analytics" target="_blank">
                                    <HelpCircle size={20} className="mr-2 h-5 w-5" />
                                    View analytics guide
                                </a>
                            </Button>
                        </div>
                    </div>
                    <div>
                        <Expander expanded={!!recording}>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableHead>Gameplay started</TableHead>
                                        <TableCell>
                                            {runData.startedAt && <RelativeDate date={runData.startedAt} />}
                                        </TableCell>
                                    </TableRow>
                                    {hollowKnightVersions && (
                                        <TableRow>
                                            <TableHead>Hollow Knight version</TableHead>
                                            <TableCell>
                                                {hollowKnightVersions.map((it) => (
                                                    <span className="block" key={it}>
                                                        {it}
                                                    </span>
                                                ))}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    <TableRow>
                                        <TableHead>HKViz mod version</TableHead>
                                        <TableCell>
                                            {recording?.allHkVizModVersions.map((it) => (
                                                <span className="block" key={it}>
                                                    {it}
                                                </span>
                                            ))}
                                        </TableCell>
                                    </TableRow>
                                    {fiteredModVersions?.map((mod) => (
                                        <TableRow key={mod.name}>
                                            <TableHead>{mod.name} version</TableHead>
                                            <TableCell>
                                                {mod.versions.map((it) => (
                                                    <span className="block" key={it}>
                                                        {it}
                                                    </span>
                                                ))}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Expander>
                    </div>
                </div>
            </div>
        </div>
    );
}
