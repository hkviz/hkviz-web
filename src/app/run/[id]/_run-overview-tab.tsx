import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { AreaChart, Play } from 'lucide-react';
import { type Session } from 'next-auth';
import { RelativeDate } from '~/app/_components/date';
import { RunCard } from '~/app/_components/run-card';
import { type AppRouterOutput } from '~/server/api/types';
import { type UseViewOptionsStore } from './_viewOptionsStore';

export function RunOverviewTab({
    useViewOptionsStore,
    runData,
    session,
    className,
}: {
    useViewOptionsStore: UseViewOptionsStore;
    runData: AppRouterOutput['run']['getMetadataById'];
    session: Session | null;
    className?: string;
}) {
    const isOwnRun = session?.user?.id === runData.user.id;

    const mainCardTab = useViewOptionsStore((s) => s.mainCardTab);
    const setMainCardTab = useViewOptionsStore((s) => s.setMainCardTab);
    const setIsPlaying = useViewOptionsStore((s) => s.setIsPlaying);
    const setRoomVisibility = useViewOptionsStore((s) => s.setRoomVisibility);
    const setTraceVisibility = useViewOptionsStore((s) => s.setTraceVisibility);
    const setRoomColorVar1 = useViewOptionsStore((s) => s.setRoomColorVar1);
    const setRoomColors = useViewOptionsStore((s) => s.setRoomColors);
    const setExtraChartsFollowAnimation = useViewOptionsStore((s) => s.setExtraChartsFollowAnimation);
    const recording = useViewOptionsStore((s) => s.recording);

    const isOpen = mainCardTab === 'overview';

    function viewAnimatedAnalytics() {
        setMainCardTab('map');
        setIsPlaying(true);
        setRoomVisibility('visited-animated');
        setTraceVisibility('animated');
        setRoomColors('area');
        setExtraChartsFollowAnimation(true);
    }

    function viewStaticAnalytics() {
        setMainCardTab('map');
        setIsPlaying(false);
        setRoomVisibility('visited');
        setRoomColors('1-var');
        if (useViewOptionsStore.getState().roomColorVar1 !== 'firstVisitMs') {
            setRoomColorVar1('firstVisitMs');
        }
        setExtraChartsFollowAnimation(false);
    }

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
                <div className="grid max-w-[500px] grid-cols-2 gap-2">
                    <Button onClick={viewAnimatedAnalytics}>
                        <Play size={20} />
                        View animated analytics
                    </Button>
                    <Button onClick={viewStaticAnalytics}>
                        <AreaChart size={20} />
                        View static analytics
                    </Button>
                </div>
                <div>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableHead>Gameplay started</TableHead>
                                <TableCell>{runData.startedAt && <RelativeDate date={runData.startedAt} />}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
                {/* {recording && (
                    <div>
                        <Table>
                            <TableBody>
                                {recording.allModVersions.map((mod) => (
                                    <TableRow key={mod.name}>
                                        <TableHead>{mod.name}</TableHead>
                                        <TableCell>{mod.versions.join(', ')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )} */}
            </div>
        </div>
    );
}
