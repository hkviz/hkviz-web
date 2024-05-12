import {
    Button,
    CardHeader,
    CardTitle,
    Checkbox,
    Input,
    Table,
    TableBody,
    TableCell,
    TableRow,
    cardHeaderSmallClasses,
    cardTitleSmallClasses,
    cn,
} from '@hkviz/components';
import { assertNever, recordingSplitGroups, type RecordingSplit, type RecordingSplitGroup } from '@hkviz/parser';
import { animationStore, hoverMsStore, roomDisplayStore, splitColors, splitsStore, uiStore } from '@hkviz/viz';
import { Search, X } from 'lucide-solid';
import { For, Show, createEffect, createSignal, createUniqueId, type Component, type JSXElement } from 'solid-js';
import { Duration } from '../duration';

type RowActiveState = 'past' | 'next' | 'future';

interface RowProps {
    split: RecordingSplit;
    activeState: RowActiveState;
    scrollParent: HTMLDivElement | undefined;
}

const RunSplitRow: Component<RowProps> = (props) => {
    // const activeStateClasses =
    //     activeState === 'past'
    //         ? 'bg-green-200 dark:bg-green-900'
    //         : activeState === 'next'
    //           ? 'bg-blue-300 dark:bg-blue-800'
    //           : activeState === 'future'
    //             ? ''
    //             : assertNever(activeState);

    const activeStateClasses = () =>
        props.activeState === 'past'
            ? 'bg-gradient-to-r from-green-300/10 to-green-500/20 dark:from-green-500/10 dark:to-green-500/15'
            : props.activeState === 'next'
              ? 'bg-blue-300 dark:bg-blue-800'
              : props.activeState === 'future'
                ? ''
                : assertNever(props.activeState);

    const hasClicked = {
        hasClicked: false,
        timeout: null as any,
    };

    function handleClick() {
        console.log('split clicked', props.split);
        animationStore.setMsIntoGame(props.split.msIntoGame);
        uiStore.showMapIfOverview();

        function markClicked() {
            clearTimeout(hasClicked.timeout);
            hasClicked.hasClicked = true;
            hasClicked.timeout = setTimeout(() => {
                hasClicked.hasClicked = false;
            }, 1000);
        }

        const sceneName = props.split.previousPlayerPositionEvent?.sceneEvent?.getMainVirtualSceneName?.();
        if (sceneName) {
            if (props.activeState !== 'next') {
                roomDisplayStore.setSelectedSceneName(sceneName);
                hasClicked.hasClicked = true;
                markClicked();
            } else {
                roomDisplayStore.togglePinnedRoom(sceneName, 'split-click');
                markClicked();
            }
        }
    }

    function handleMouseEnter() {
        const sceneName = props.split.previousPlayerPositionEvent?.sceneEvent?.getMainVirtualSceneName?.();
        if (sceneName) {
            roomDisplayStore.setHoveredRoom(sceneName);
            roomDisplayStore.setSelectedRoomIfNotPinned(sceneName);
        }
        hoverMsStore.setHoveredMsIntoGame(props.split.msIntoGame);
    }

    function handleMouseLeave() {
        const sceneName = props.split.previousPlayerPositionEvent?.sceneEvent?.getMainVirtualSceneName?.();
        if (sceneName) {
            roomDisplayStore.unsetHoveredRoom(sceneName);
        }
        hoverMsStore.unsetHoveredMsIntoGame(props.split.msIntoGame);
    }

    const splitGroupColor = () => splitColors[props.split.group.name];

    let ref!: HTMLTableRowElement;

    createEffect(() => {
        if (props.activeState === 'next') {
            const tr = ref;
            const scrollDiv = props.scrollParent;
            if (!tr || !scrollDiv) return;
            const maxOk = tr.offsetTop;
            const minOk = tr.offsetTop - scrollDiv.clientHeight + tr.clientHeight;
            // (tr.parentNode! as any).scrollTop = tr.offsetTop;
            if (scrollDiv.scrollTop < minOk || scrollDiv.scrollTop > maxOk) {
                scrollDiv.scrollTo({ top: minOk, behavior: 'smooth' });
            }
        }
    });

    return (
        <TableRow ref={ref}>
            <TableCell class={cn('p-0', activeStateClasses())}>
                <button
                    onClick={handleClick}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    class="relative flex w-full flex-row items-center gap-2 p-3 pl-4"
                >
                    <div class={cn('absolute bottom-0 left-0 top-0 w-1', splitGroupColor().background)} />
                    <Show when={props.split.imageUrl}>
                        {(imageUrl) => (
                            <div
                                class="mr-2 h-7 w-7 shrink-0 bg-contain bg-center bg-no-repeat"
                                style={{
                                    ['background-image']: `url(${imageUrl()})`,
                                }}
                            />
                        )}
                    </Show>
                    <p class="flex grow flex-col items-start justify-center text-left">
                        <span>{props.split.title}</span>
                        {/* <span
                            class="-mb-1 mt-1 rounded-lg bg-slate-400 px-1 py-0.5 text-[.5rem] font-bold leading-none text-black"
                            style={{ backgroundColor: scene?.color?.formatHex() }}
                        >
                            {displaySceneName}
                        </span> */}
                        {/* <span class="-mb-1 rounded-lg py-0.5 text-[.6rem] font-bold leading-none" style={{ color }}>
                            {displaySceneName}
                        </span> */}
                    </p>
                    <Duration ms={props.split.msIntoGame} class="pr-3" withTooltip={false} />
                </button>
            </TableCell>
        </TableRow>
    );
};

const RunSplitsRows: Component = () => {
    const filteredSplits = splitsStore.filteredSplits;
    const nextSplitIndex = splitsStore.nextSplitIndex;

    const [scrollDiv, setScrollDiv] = createSignal<HTMLDivElement>();

    return (
        <div class="grow overflow-y-auto lg:shrink lg:basis-0" ref={setScrollDiv}>
            <Table class="w-full">
                <TableBody>
                    <For each={filteredSplits()}>
                        {(split, index) => {
                            const activeState = () =>
                                nextSplitIndex() === -1 || nextSplitIndex() === undefined
                                    ? 'past'
                                    : nextSplitIndex() === index()
                                      ? 'next'
                                      : index() < nextSplitIndex()
                                        ? 'past'
                                        : 'future';
                            return <RunSplitRow split={split} activeState={activeState()} scrollParent={scrollDiv()} />;
                        }}
                    </For>
                </TableBody>
            </Table>
        </div>
    );
};

interface RunSplitsProps {
    resizeOptions?: JSXElement;
}

const RunSplitsSearch: Component = () => {
    const filterTerm = splitsStore.filterTerm;
    const show = splitsStore.isSplitsPanelOpen;

    return (
        <div class="relative mx-3 shrink grow">
            <Show when={show()}>
                {show() && (
                    <>
                        <Search class="absolute left-0 top-0 m-2.5 h-4 w-4" />
                        <Input
                            type="text"
                            value={filterTerm()}
                            onInput={(e) => splitsStore.setFilterTerm(e.target.value)}
                            placeholder="Search"
                            class="h-9 shrink grow px-8"
                        />
                        <Show when={filterTerm()}>
                            <Button
                                onClick={() => splitsStore.setFilterTerm('')}
                                class="absolute right-0 top-0 flex h-9 w-9 items-center justify-center p-0"
                                variant="ghost"
                                title="Clear search"
                            >
                                <X class="h-4 w-4" />
                            </Button>
                        </Show>
                    </>
                )}
            </Show>
        </div>
    );
};

export const RunSplits: Component<RunSplitsProps> = (props) => {
    const id = createUniqueId();
    const visibleSplitGroups = splitsStore.visibleSplitGroups;

    const setVisibleSplitGroupChecked = (group: RecordingSplitGroup, checked: boolean) => {
        const currentGroup = splitsStore.visibleSplitGroups();
        splitsStore.setVisibleSplitGroups(checked ? [...currentGroup, group] : currentGroup.filter((g) => g !== group));
    };

    return (
        <div class="run-splits flex h-full flex-col">
            <CardHeader class={cardHeaderSmallClasses}>
                <CardTitle class={cn(cardTitleSmallClasses, 'flex w-full flex-row items-center justify-between gap-2')}>
                    Splits
                    <RunSplitsSearch />
                    {props.resizeOptions}
                </CardTitle>
            </CardHeader>
            <div class="flex flex-wrap gap-1 p-3 pt-0">
                <For each={recordingSplitGroups}>
                    {(group) => {
                        const checked = () => visibleSplitGroups().includes(group);
                        const color = splitColors[group.name];
                        return (
                            <div class="flex flex-row">
                                <Checkbox
                                    id={id + '_run_split_option_' + group.name}
                                    checked={checked()}
                                    onChange={(checked) => setVisibleSplitGroupChecked(group, checked as boolean)}
                                    controlClass={color.checkboxSolid}
                                />
                                <label
                                    for={id + '_run_split_option_' + group.name + '-input'}
                                    class="grow pl-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {group.displayName}
                                </label>
                            </div>
                        );
                    }}
                </For>
            </div>
            <hr />
            <RunSplitsRows />
        </div>
    );
};
