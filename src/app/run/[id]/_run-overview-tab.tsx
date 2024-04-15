import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { AreaChart, HelpCircle, Play } from 'lucide-react';
import { type Session } from 'next-auth';
import { useMemo } from 'react';
import { RelativeDate } from '~/app/_components/date';
import { Expander } from '~/app/_components/expander';
import { RunCard } from '~/app/_components/run-card';
import { playerDataFields } from '~/lib/viz/player-data/player-data';
import { type GetRunResult } from '~/server/api/routers/run/run-get';
import { type UseViewOptionsStore } from '../../../lib/stores/view-options-store';

export function RunOverviewTab({
    useViewOptionsStore,
    runData,
    session,
    className,
}: {
    useViewOptionsStore: UseViewOptionsStore;
    runData: GetRunResult;
    session: Session | null;
    className?: string;
}) {
    const isOwnRun = session?.user?.id === runData.user.id;

    const mainCardTab = useViewOptionsStore((s) => s.mainCardTab);
    const setMainCardTab = useViewOptionsStore((s) => s.setMainCardTab);
    const setIsPlaying = useViewOptionsStore((s) => s.setIsPlaying);
    const setRoomVisibility = useViewOptionsStore((s) => s.setRoomVisibility);
    const setTraceVisibility = useViewOptionsStore((s) => s.setTraceVisibility);
    const cycleRoomColorVar1 = useViewOptionsStore((s) => s.cycleRoomColorVar1);
    const setRoomColors = useViewOptionsStore((s) => s.setRoomColors);
    const setExtraChartsFollowAnimation = useViewOptionsStore((s) => s.setExtraChartsFollowAnimation);
    const setZoomFollowEnabled = useViewOptionsStore((s) => s.setZoomFollowEnabled);
    const setZoomFollowTarget = useViewOptionsStore((s) => s.setZoomFollowTarget);
    const recording = useViewOptionsStore((s) => s.recording);

    const isOpen = mainCardTab === 'overview';

    function viewAnimatedAnalytics() {
        setMainCardTab('map');
        setIsPlaying(true);
        setRoomVisibility('visited-animated');
        setTraceVisibility('animated');
        setRoomColors('area');
        setExtraChartsFollowAnimation(true);
        setZoomFollowEnabled(true);
        setZoomFollowTarget('current-zone');
    }

    function viewStaticAnalytics() {
        setMainCardTab('map');
        setIsPlaying(false);
        setRoomVisibility('visited');
        setRoomColors('1-var');
        if (useViewOptionsStore.getState().roomColorVar1 !== 'firstVisitMs') {
            cycleRoomColorVar1('firstVisitMs');
        }
        setExtraChartsFollowAnimation(false);
        setZoomFollowEnabled(true);
        setZoomFollowTarget('visible-rooms');
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
                'flex items-center justify-center pt-20 transition',
                isOpen ? 'visible backdrop-blur-md' : 'pointer-events-none invisible backdrop-blur-none',
                className,
            )}
        >
            <div className={cn('absolute inset-0 bg-card', isOpen ? 'opacity-75' : 'opacity-0')} />
            <div
                className={cn(
                    'relative z-10 flex w-full max-w-[700px] flex-col items-center gap-4 transition',
                    isOpen ? '' : 'scale-75 opacity-0',
                )}
            >
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
    );
}
