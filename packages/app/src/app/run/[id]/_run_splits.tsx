import { cardHeaderSmallClasses, cardTitleSmallClasses } from '@/components/additions/card';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useSignals } from '@preact/signals-react/runtime';
import { Search, X } from 'lucide-react';
import { forwardRef, useCallback, useEffect, useId, useMemo, useRef, type ReactNode } from 'react';
import { animationStore } from '~/lib/stores/animation-store';
import { hoverMsStore } from '~/lib/stores/hover-ms-store';
import { roomDisplayStore } from '~/lib/stores/room-display-store';
import { splitsStore } from '~/lib/stores/splits-store';
import { uiStore } from '~/lib/stores/ui-store';
import { assertNever } from '@hkviz/parser';
import { recordingSplitGroups, type RecordingSplit, type RecordingSplitGroup } from '@hkviz/parser';
import { Duration } from './_duration';
import { splitColors } from '@hkviz/viz';

type RowActiveState = 'past' | 'next' | 'future';

interface RowProps {
    split: RecordingSplit;
    activeState: RowActiveState;
}

const RunSplitRow = forwardRef<HTMLTableRowElement, RowProps>(function RunSplitRow(
    { split, activeState }: RowProps,
    ref: any,
) {
    // const activeStateClasses =
    //     activeState === 'past'
    //         ? 'bg-green-200 dark:bg-green-900'
    //         : activeState === 'next'
    //           ? 'bg-blue-300 dark:bg-blue-800'
    //           : activeState === 'future'
    //             ? ''
    //             : assertNever(activeState);

    const activeStateRef = useRef(activeState);
    activeStateRef.current = activeState;

    const activeStateClasses =
        activeState === 'past'
            ? 'bg-gradient-to-r from-green-300/10 to-green-500/20 dark:from-green-500/10 dark:to-green-500/15'
            : activeState === 'next'
              ? 'bg-blue-300 dark:bg-blue-800'
              : activeState === 'future'
                ? ''
                : assertNever(activeState);

    const hasClicked = useRef({
        hasClicked: false,
        timeout: null as any,
    });

    const button = useMemo(() => {
        function handleClick() {
            console.log('split clicked', split);
            animationStore.setMsIntoGame(split.msIntoGame);
            uiStore.showMapIfOverview();

            function markClicked() {
                clearTimeout(hasClicked.current.timeout);
                hasClicked.current.hasClicked = true;
                hasClicked.current.timeout = setTimeout(() => {
                    hasClicked.current.hasClicked = false;
                }, 1000);
            }

            const sceneName = split.previousPlayerPositionEvent?.sceneEvent?.getMainVirtualSceneName?.();
            if (sceneName) {
                if (activeStateRef.current !== 'next') {
                    roomDisplayStore.setSelectedSceneName(sceneName);
                    hasClicked.current.hasClicked = true;
                    markClicked();
                } else {
                    roomDisplayStore.togglePinnedRoom(sceneName, 'split-click');
                    markClicked();
                }
            }
        }
        function handleMouseEnter() {
            const sceneName = split.previousPlayerPositionEvent?.sceneEvent?.getMainVirtualSceneName?.();
            if (sceneName) {
                roomDisplayStore.setHoveredRoom(sceneName);
                roomDisplayStore.setSelectedRoomIfNotPinned(sceneName);
            }
            hoverMsStore.setHoveredMsIntoGame(split.msIntoGame);
        }
        function handleMouseLeave() {
            const sceneName = split.previousPlayerPositionEvent?.sceneEvent?.getMainVirtualSceneName?.();
            if (sceneName) {
                roomDisplayStore.unsetHoveredRoom(sceneName);
            }
            hoverMsStore.unsetHoveredMsIntoGame(split.msIntoGame);
        }

        let icon: ReactNode | undefined = undefined;
        if (split.imageUrl) {
            // icon = <Image src={split.imageUrl} className="mr-2 h-6 w-6" width={84} height={96} alt="" />;
            icon = (
                <div
                    className="mr-2 h-7 w-7 shrink-0 bg-contain bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url(${split.imageUrl})`,
                    }}
                />
            );
        }

        const splitGroupColor = splitColors[split.group.name];

        // const sceneName = split.previousPlayerPositionEvent?.sceneEvent?.getMainVirtualSceneName?.();
        // const scene = sceneName ? mainRoomDataBySceneName.get(sceneName) ?? null : null;
        // const displaySceneName = scene
        //     ? scene.zoneNameFormatted // + ' - ' + scene.roomNameFormattedZoneExclusive
        //     : sceneName;

        // const color = scene ? changeRoomColorForLightTheme(scene.color) : undefined;

        return (
            <button
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="relative flex w-full flex-row items-center gap-2 p-3 pl-4"
            >
                <div className={cn('absolute bottom-0 left-0 top-0 w-1', splitGroupColor.background)}></div>
                {icon}
                <p className="flex grow flex-col items-start justify-center text-left">
                    <span>{split.title}</span>
                    {/* <span
                        className="-mb-1 mt-1 rounded-lg bg-slate-400 px-1 py-0.5 text-[.5rem] font-bold leading-none text-black"
                        style={{ backgroundColor: scene?.color?.formatHex() }}
                    >
                        {displaySceneName}
                    </span> */}
                    {/* <span className="-mb-1 rounded-lg py-0.5 text-[.6rem] font-bold leading-none" style={{ color }}>
                        {displaySceneName}
                    </span> */}
                </p>
                <Duration ms={split.msIntoGame} className="pr-3" withTooltip={false} />
            </button>
        );
    }, [split, activeStateRef]);

    return (
        <TableRow ref={ref}>
            <TableCell className={cn('p-0', activeStateClasses)}>{button}</TableCell>
        </TableRow>
    );
});

function RunSplitsRows() {
    useSignals();
    const filteredSplits = splitsStore.filteredSplits.value;
    const nextSplitIndex = splitsStore.nextSplitIndex.value;

    const scrollDivRef = useRef<HTMLDivElement | null>(null);
    const splitRefs = useRef<(HTMLTableRowElement | null)[]>([]);
    useEffect(() => {
        splitRefs.current = splitRefs.current.slice(0, filteredSplits.length);
    }, [filteredSplits.length]);

    useEffect(() => {
        const scrollToIndex =
            nextSplitIndex === -1 || nextSplitIndex === undefined ? filteredSplits.length - 1 : nextSplitIndex;
        if (scrollToIndex >= 0 && scrollToIndex < filteredSplits.length) {
            // splitRefs.current[scrollToIndex]?.scrollIntoView({
            //     behavior: 'smooth',
            //     block: 'nearest',
            //     inline: 'start',
            // });

            const tr = splitRefs.current[scrollToIndex];
            const scrollDiv = scrollDivRef.current;
            if (!tr || !scrollDiv) return;
            const maxOk = tr.offsetTop;
            const minOk = tr.offsetTop - scrollDiv.clientHeight + tr.clientHeight;
            // (tr.parentNode! as any).scrollTop = tr.offsetTop;
            if (scrollDiv.scrollTop < minOk || scrollDiv.scrollTop > maxOk) {
                scrollDiv.scrollTo({ top: minOk, behavior: 'smooth' });
            }
        }
    }, [nextSplitIndex, filteredSplits.length]);

    return (
        <div className="grow overflow-y-auto lg:shrink lg:basis-0" ref={scrollDivRef}>
            <Table className="w-full">
                <TableBody>
                    {filteredSplits?.map((split, index) => {
                        const activeState =
                            nextSplitIndex === -1 || nextSplitIndex === undefined
                                ? 'past'
                                : nextSplitIndex === index
                                  ? 'next'
                                  : index < nextSplitIndex
                                    ? 'past'
                                    : 'future';
                        return (
                            <RunSplitRow
                                key={index}
                                split={split}
                                activeState={activeState}
                                ref={(el) => {
                                    splitRefs.current[index] = el;
                                }}
                            />
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

interface RunSplitsProps {
    resizeOptions?: ReactNode;
}

function RunSplitsSearch() {
    useSignals();
    const filterTerm = splitsStore.filterTerm.valuePreact;
    const show = splitsStore.isSplitsPanelOpen.value;

    return (
        <div className="relative mx-3 shrink grow">
            {show && (
                <>
                    <Search className="absolute left-0 top-0 m-2.5 h-4 w-4" />
                    <Input
                        type="text"
                        value={filterTerm}
                        onChange={(e) => splitsStore.setFilterTerm(e.target.value)}
                        placeholder="Search"
                        className="h-9 shrink grow px-8"
                    />
                    {filterTerm && (
                        <Button
                            onClick={() => splitsStore.setFilterTerm('')}
                            className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center p-0"
                            variant="ghost"
                            title="Clear search"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </>
            )}
        </div>
    );
}

export function RunSplits({ resizeOptions }: RunSplitsProps) {
    useSignals();
    const id = useId();
    const visibleSplitGroups = splitsStore.visibleSplitGroups.valuePreact;

    const setVisibleSplitGroupChecked = useCallback((group: RecordingSplitGroup, checked: boolean) => {
        const currentGroup = splitsStore.visibleSplitGroups.valuePreact;
        splitsStore.setVisibleSplitGroups(checked ? [...currentGroup, group] : currentGroup.filter((g) => g !== group));
    }, []);

    return (
        <div className="run-splits flex h-full flex-col">
            <CardHeader className={cardHeaderSmallClasses}>
                <CardTitle
                    className={cn(cardTitleSmallClasses, 'flex w-full flex-row items-center justify-between gap-2')}
                >
                    Splits
                    <RunSplitsSearch />
                    {resizeOptions}
                </CardTitle>
            </CardHeader>
            <div className="flex flex-wrap gap-1 p-3 pt-0">
                {recordingSplitGroups.map((group) => {
                    const checked = visibleSplitGroups.includes(group);
                    const color = splitColors[group.name];
                    return (
                        <div className="flex flex-row" key={group.name}>
                            <Checkbox
                                id={id + '_run_split_option_' + group.name}
                                checked={checked}
                                onCheckedChange={(checked) => setVisibleSplitGroupChecked(group, checked as boolean)}
                                className={color.checkbox}
                            />
                            <label
                                htmlFor={id + '_run_split_option_' + group.name}
                                className="grow pl-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {group.displayName}
                            </label>
                        </div>
                    );
                })}
            </div>
            <hr />
            <RunSplitsRows />
        </div>
    );
}
