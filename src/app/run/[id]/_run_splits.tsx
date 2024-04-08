import { cardHeaderSmallClasses, cardTitleSmallClasses } from '@/components/additions/cards';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { forwardRef, useCallback, useEffect, useId, useMemo, useRef, type ReactNode } from 'react';
import { assertNever } from '~/lib/utils/utils';
import { darkenRoomColorForLightTheme } from '~/lib/viz/charts/use-room-coloring';
import { mainRoomDataBySceneName } from '~/lib/viz/map-data/rooms';
import {
    recordingSplitGroups,
    type RecordingSplit,
    type RecordingSplitGroup,
} from '~/lib/viz/recording-files/recording-splits';
import { Duration } from './_duration';
import { type UseViewOptionsStore } from './_viewOptionsStore';

type RowActiveState = 'past' | 'next' | 'future';

interface RowProps {
    split: RecordingSplit;
    activeState: RowActiveState;
    useViewOptionsStore: UseViewOptionsStore;
}

const RunSplitRow = forwardRef<HTMLTableRowElement, RowProps>(function RunSplitRow(
    { split, activeState, useViewOptionsStore }: RowProps,
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

    const activeStateClasses =
        activeState === 'past'
            ? 'bg-gradient-to-r from-green-300/10 to-green-500/20 dark:from-green-500/10 dark:to-green-500/15'
            : activeState === 'next'
              ? 'bg-blue-300 dark:bg-blue-800'
              : activeState === 'future'
                ? ''
                : assertNever(activeState);

    const button = useMemo(() => {
        function handleClick() {
            console.log('split clicked', split);
            useViewOptionsStore.getState().setAnimationMsIntoGame(split.msIntoGame);
            useViewOptionsStore.getState().showMapIfOverview();

            const sceneName = split.previousPlayerPositionEvent?.sceneEvent?.getMainVirtualSceneName?.();
            if (sceneName) {
                useViewOptionsStore.getState().setSelectedRoom(sceneName);
                // useViewOptionsStore.getState().togglePinnedRoom(sceneName, true);
            }
        }
        function handleMouseEnter() {
            const sceneName = split.previousPlayerPositionEvent?.sceneEvent?.getMainVirtualSceneName?.();
            if (sceneName) {
                useViewOptionsStore.getState().setHoveredRoom(sceneName);
                useViewOptionsStore.getState().setSelectedRoomIfNotPinned(sceneName);
            }
            useViewOptionsStore.getState().setHoveredMsIntoGame(split.msIntoGame);
        }
        function handleMouseLeave() {
            const sceneName = split.previousPlayerPositionEvent?.sceneEvent?.getMainVirtualSceneName?.();
            if (sceneName) {
                useViewOptionsStore.getState().unsetHoveredRoom(sceneName);
            }
            useViewOptionsStore.getState().unsetHoveredMsIntoGame(split.msIntoGame);
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

        const sceneName = split.previousPlayerPositionEvent?.sceneEvent?.getMainVirtualSceneName?.();
        const scene = sceneName ? mainRoomDataBySceneName.get(sceneName) ?? null : null;
        const displaySceneName = scene
            ? scene.zoneNameFormatted // + ' - ' + scene.roomNameFormattedZoneExclusive
            : sceneName;

        const color = scene ? darkenRoomColorForLightTheme(scene.color) : undefined;

        return (
            <button
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="relative flex w-full flex-row items-center gap-2 p-3 pl-4"
            >
                <div className={cn('absolute bottom-0 left-0 top-0 w-1', split.group.color.background)}></div>
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
    }, [split, useViewOptionsStore]);

    return (
        <TableRow ref={ref}>
            <TableCell className={cn('p-0', activeStateClasses)}>{button}</TableCell>
        </TableRow>
    );
});
interface RunSplitsRowsProps {
    useViewOptionsStore: UseViewOptionsStore;
}

function RunSplitsRows({ useViewOptionsStore }: RunSplitsRowsProps) {
    const filteredSplits = useViewOptionsStore((state) => state.filteredSplits);
    const nextSplitIndex = useViewOptionsStore((state) => state.nextSplitIndex);

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
                                ref={(el) => (splitRefs.current[index] = el)}
                                useViewOptionsStore={useViewOptionsStore}
                            />
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

interface RunSplitsProps {
    useViewOptionsStore: UseViewOptionsStore;
    resizeOptions: ReactNode;
}

export function RunSplits({ useViewOptionsStore, resizeOptions }: RunSplitsProps) {
    const id = useId();
    const setVisibleSplitGroups = useViewOptionsStore((state) => state.setVisibleSplitGroups);
    const visibleSplitGroups = useViewOptionsStore((state) => state.visibleSplitGroups);

    const setVisibleSplitGroupChecked = useCallback(
        (group: RecordingSplitGroup, checked: boolean) => {
            const currentGroup = useViewOptionsStore.getState().visibleSplitGroups;
            setVisibleSplitGroups(checked ? [...currentGroup, group] : currentGroup.filter((g) => g !== group));
        },
        [setVisibleSplitGroups, useViewOptionsStore],
    );

    return (
        <div className="flex h-full flex-col">
            <CardHeader className={cardHeaderSmallClasses}>
                <CardTitle className={cn(cardTitleSmallClasses, 'flex w-full flex-row justify-between')}>
                    Splits
                    {resizeOptions}
                </CardTitle>
            </CardHeader>
            <div className="flex flex-wrap gap-1 p-3 pt-0">
                {recordingSplitGroups.map((group) => {
                    const checked = visibleSplitGroups.includes(group);
                    return (
                        <div className="flex flex-row" key={group.name}>
                            <Checkbox
                                id={id + '_run_split_option_' + group.name}
                                checked={checked}
                                onCheckedChange={(checked) => setVisibleSplitGroupChecked(group, checked as boolean)}
                                className={group.color.checkbox}
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
            <RunSplitsRows useViewOptionsStore={useViewOptionsStore} />
        </div>
    );
}
