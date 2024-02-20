import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { forwardRef, memo, useCallback, useEffect, useId, useMemo, useRef, type ReactNode } from 'react';
import { assertNever } from '~/lib/utils/utils';
import {
    RecordingSplitGroups,
    type RecordingSplit,
    type RecordingSplitGroup,
} from '~/lib/viz/recording-files/recording-splits';
import { Duration } from './_duration';
import { type UseViewOptionsStore } from './_viewOptionsStore';

type RowActiveState = 'past' | 'next' | 'future';

interface RowProps {
    split: RecordingSplit;
    setAnimationMsIntoGame: (ms: number) => void;
    activeState: RowActiveState;
}

const RunSplitRow = memo(
    forwardRef<HTMLTableRowElement, RowProps>(function RunSplitRow(
        { split, setAnimationMsIntoGame, activeState }: RowProps,
        ref: any,
    ) {
        let icon: ReactNode | undefined = undefined;
        if (split.imageUrl) {
            icon = <Image src={split.imageUrl} className="mr-2 h-6 w-6" width={84} height={96} alt="" />;
        }

        function handleClick() {
            console.log('split clicked', split);
            setAnimationMsIntoGame(split.msIntoGame);
        }

        const activeStateClasses =
            activeState === 'past'
                ? 'bg-green-200 dark:bg-green-900'
                : activeState === 'next'
                  ? 'bg-blue-300 dark:bg-blue-800'
                  : activeState === 'future'
                    ? ''
                    : assertNever(activeState);

        return (
            <TableRow ref={ref}>
                <TableCell className={cn('p-0', activeStateClasses)}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button onClick={handleClick} className="flex w-full flex-row gap-2 p-4">
                                {icon}
                                <span className="grow text-left">{split.title}</span>
                                <Duration ms={split.msIntoGame} className="pr-3" withTooltip={false} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>{split.tooltip}</TooltipContent>
                    </Tooltip>
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
    const setAnimationMsIntoGame = useViewOptionsStore((state) => state.setAnimationMsIntoGame);
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

    const splitRefs = useRef<(HTMLTableRowElement | null)[]>([]);
    useEffect(() => {
        splitRefs.current = splitRefs.current.slice(0, filteredSplits.length);
    }, [filteredSplits.length]);

    useEffect(() => {
        const scrollToIndex =
            nextSplitIndex === -1 || nextSplitIndex === undefined ? filteredSplits.length - 1 : nextSplitIndex;
        if (scrollToIndex >= 0 && scrollToIndex < filteredSplits.length) {
            splitRefs.current[scrollToIndex]?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'start',
            });
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
                        {RecordingSplitGroups.map((group) => {
                            const checked = visibleSplitGroups.includes(group.name);
                            return (
                                <div className="flex flex-row gap-2" key={group.name}>
                                    <Checkbox
                                        id={id + '_run_split_option_' + group.name}
                                        checked={checked}
                                        onCheckedChange={(checked) =>
                                            setVisibleSplitGroupChecked(group.name, checked as boolean)
                                        }
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
                <div className="grow overflow-y-auto lg:shrink lg:basis-0">
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
                                        setAnimationMsIntoGame={setAnimationMsIntoGame}
                                        activeState={activeState}
                                        ref={(el) => (splitRefs.current[index] = el)}
                                    />
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </>
        ),
        [filteredSplits, visibleSplitGroups, id, setVisibleSplitGroupChecked, nextSplitIndex, setAnimationMsIntoGame],
    );
}
