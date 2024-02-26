import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { forwardRef, memo, useCallback, useEffect, useId, useMemo, useRef, type ReactNode } from 'react';
import { assertNever } from '~/lib/utils/utils';
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

const RunSplitRow = memo(
    forwardRef<HTMLTableRowElement, RowProps>(function RunSplitRow(
        { split, activeState, useViewOptionsStore }: RowProps,
        ref: any,
    ) {
        const setAnimationMsIntoGame = useViewOptionsStore((state) => state.setAnimationMsIntoGame);
        const setHoveredRoom = useViewOptionsStore((state) => state.setHoveredRoom);
        const unsetHoveredRoom = useViewOptionsStore((state) => state.unsetHoveredRoom);
        const setHoveredMsIntoGame = useViewOptionsStore((state) => state.setHoveredMsIntoGame);
        const unsetHoveredMsIntoGame = useViewOptionsStore((state) => state.unsetHoveredMsIntoGame);
        const setSelectedRoom = useViewOptionsStore((state) => state.setSelectedRoom);
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

        function handleClick() {
            console.log('split clicked', split);
            setAnimationMsIntoGame(split.msIntoGame);

            const sceneName = split.previousPlayerPositionEvent?.sceneEvent?.getMainVirtualSceneName?.();
            if (sceneName) {
                setSelectedRoom(sceneName);
            }
        }
        function handleMouseEnter() {
            const sceneName = split.previousPlayerPositionEvent?.sceneEvent?.getMainVirtualSceneName?.();
            if (sceneName) {
                setHoveredRoom(sceneName);
            }
            setHoveredMsIntoGame(split.msIntoGame);
        }
        function handleMouseLeave() {
            const sceneName = split.previousPlayerPositionEvent?.sceneEvent?.getMainVirtualSceneName?.();
            if (sceneName) {
                unsetHoveredRoom(sceneName);
            }
            unsetHoveredMsIntoGame(split.msIntoGame);
        }

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

        return (
            <TableRow ref={ref}>
                <TableCell className={cn('p-0', activeStateClasses)}>
                    {/* <Tooltip>
                        <TooltipTrigger asChild> */}
                    <button
                        onClick={handleClick}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        className="relative flex w-full flex-row gap-2 p-4"
                    >
                        <div className={cn('absolute bottom-0 left-0 top-0 w-1', split.group.color.background)}></div>
                        {icon}
                        <span className="grow text-left">{split.title}</span>
                        <Duration ms={split.msIntoGame} className="pr-3" withTooltip={false} />
                    </button>
                    {/* </TooltipTrigger>
                        <TooltipContent>{split.tooltip}</TooltipContent>
                    </Tooltip> */}
                </TableCell>
            </TableRow>
        );
    }),
);

interface Props {
    useViewOptionsStore: UseViewOptionsStore;
}

const EMPTY_ARRAY = [] as const;

export function RunSplits({ useViewOptionsStore }: Props) {
    const id = useId();
    const recording = useViewOptionsStore((state) => state.recording);
    const animationMsIntoGame = useViewOptionsStore((state) => state.animationMsIntoGame);
    const setVisibleSplitGroups = useViewOptionsStore((state) => state.setVisibleSplitGroups);
    const visibleSplitGroups = useViewOptionsStore((state) => state.visibleSplitGroups);
    const splits = recording?.splits ?? EMPTY_ARRAY;

    const filteredSplits = useMemo(
        () => splits.filter((split) => visibleSplitGroups.includes(split.group)),
        [splits, visibleSplitGroups],
    );

    const nextSplitIndex = useMemo(
        () =>
            filteredSplits?.findIndex(
                (split, index) =>
                    split.msIntoGame >= animationMsIntoGame &&
                    filteredSplits[index + 1]?.msIntoGame !== split.msIntoGame,
            ),
        [animationMsIntoGame, filteredSplits],
    );

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

    const setVisibleSplitGroupChecked = useCallback(
        (group: RecordingSplitGroup, checked: boolean) => {
            const currentGroup = useViewOptionsStore.getState().visibleSplitGroups;
            setVisibleSplitGroups(checked ? [...currentGroup, group] : currentGroup.filter((g) => g !== group));
        },
        [setVisibleSplitGroups, useViewOptionsStore],
    );

    return useMemo(
        () => (
            <>
                <div>
                    <div className="flex flex-wrap gap-2 p-4">
                        {recordingSplitGroups.map((group) => {
                            const checked = visibleSplitGroups.includes(group);
                            return (
                                <div className="flex flex-row gap-2" key={group.name}>
                                    <Checkbox
                                        id={id + '_run_split_option_' + group.name}
                                        checked={checked}
                                        onCheckedChange={(checked) =>
                                            setVisibleSplitGroupChecked(group, checked as boolean)
                                        }
                                        className={group.color.checkbox}
                                    />
                                    <label
                                        htmlFor={id + '_run_split_option_' + group.name}
                                        className="grow text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {group.displayName}
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <hr />
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
            </>
        ),
        [filteredSplits, visibleSplitGroups, id, setVisibleSplitGroupChecked, nextSplitIndex, useViewOptionsStore],
    );
}
