import {
    Badge,
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Expander,
    cn,
    showToast,
} from '@hkviz/components';
import {
    RelativeDate,
    coin2 as coin2Img,
    dreamNailAwokenImg,
    dreamNailImg,
    healthFrameImg,
    healthFrameSteelSoulBrokenImg,
    healthFrameSteelSoulImg,
    healthFrameSteelSoulSmallImg,
    maskImg,
    steelMaskImg,
    vesselImg,
    vesselSteelSoul as vesselSteelSoulImg,
} from '@hkviz/viz-ui';
import { A, useAction } from '@solidjs/router';
import { ChevronDown } from 'lucide-solid';
import { For, Index, Match, Show, Switch, createEffect, createSignal, type Component, type JSXElement } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { visibilities, visibilityByCode, type VisibilityCode } from '~/lib/types/visibility';
import { type RunMetadata } from '~/server/run/_find_runs_internal';
import { type GetRunResult } from '~/server/run/run-get';
import { runSetVisibilityAction } from '~/server/run/run-set-visibility';
import { getMapZoneHudBackground } from './area-background';
import { RunTags } from './run-tags';

function Duration({ seconds }: { seconds: number }) {
    const hours = Math.floor(seconds / 60 / 60);
    const minutes = Math.floor((seconds / 60) % 60);

    const duration: string[] = [];
    if (hours > 0) duration.push(`${hours}h`);
    if (minutes > 0) duration.push(`${minutes}m`);

    if (duration.length === 0) return <span>0m</span>;

    return <>{duration.join(' ')}</>;
}

const interactiveBrightnessClasses =
    'group-focus-within:brightness-110 group-hover:brightness-110 group-focus:brightness-110 group-active:brightness-90';

const HealthFrame: Component<{ isSteelSoul: boolean; isBrokenSteelSoul: boolean }> = (props) => {
    return (
        <Switch
            fallback={
                <img
                    src={healthFrameImg}
                    alt="Standard game mode frame"
                    class="absolute left-1 top-0 z-[2] h-[6rem] w-auto max-w-none"
                />
            }
        >
            <Match when={props.isBrokenSteelSoul}>
                <img
                    src={healthFrameSteelSoulBrokenImg}
                    alt="Broken Steel Soul game mode frame"
                    class={cn(
                        'absolute left-[-2.5rem] top-[-2rem] z-[2] h-[10rem] w-auto max-w-none',
                        interactiveBrightnessClasses,
                    )}
                />
            </Match>
            <Match when={props.isSteelSoul}>
                <img
                    src={healthFrameSteelSoulImg}
                    alt="Steel Soul game mode frame"
                    class={cn(
                        'roup-focus-visible:brightness-110 absolute left-[-2.5rem] top-[-2rem] z-[2] hidden h-[10rem] w-auto max-w-none sm:block',
                        interactiveBrightnessClasses,
                    )}
                />
                <img
                    src={healthFrameSteelSoulSmallImg}
                    alt="Steel Soul game mode frame"
                    class={cn(
                        'absolute left-[-2.5rem] top-[-2rem] z-[2] h-[10rem] w-auto max-w-none sm:hidden',
                        interactiveBrightnessClasses,
                    )}
                />
            </Match>
        </Switch>
    );
};

const RunCardEpicInfo: Component<{
    title: JSXElement;
    class?: string;
    href?: string;
    children: JSXElement;
}> = (props) => {
    const spans = (
        <span class={cn('z-[4] flex flex-row items-baseline gap-1 drop-shadow-sm', props.class)}>
            <span class="text-xs md:text-sm">{props.title}</span>
            <span class="text-sm font-bold md:text-base">{props.children}</span>
        </span>
    );

    return (
        <Show when={props.href} fallback={spans}>
            {(href) => (
                <A href={href()} class="hover:drop-shadow-glow-md z-[7] hover:underline">
                    {spans}
                </A>
            )}
        </Show>
    );
};

const RunTitle: Component<{ run: RunMetadata; isOwnRun: boolean }> = (props) => {
    // TODO add title editing
    return (
        <Show when={props.run.title}>
            <h2 class="color-white relative z-[8] font-serif text-xl font-bold drop-shadow-sm md:text-2xl">
                {props.run.title}
            </h2>
        </Show>
    );

    // const { toast } = useToast();

    // const setTitleMutation = api.run.setTitle.useMutation({
    //     onSuccess: () => {
    //         toast({
    //             title: 'Successfully updated title',
    //         });
    //     },
    //     onError: (err) => {
    //         toast({
    //             title: 'Failed to update title',
    //             description: `${err.data?.code}: ${err?.message}`,
    //         });
    //     },
    // });

    // const textareaRef = useRef<HTMLTextAreaElement>(null);

    // const updateInputSize = useCallback(() => {
    //     if (textareaRef.current) {
    //         textareaRef.current.style.width = `min(${Math.max(textareaRef.current.value.length * 1.5 + 5, 10)}ch, 100%)`;
    //         textareaRef.current.style.height = 'auto';
    //         textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    //     }
    // }, []);

    // useEffect(() => {
    //     if (!textareaRef.current) return;
    //     textareaRef.current.value = run.title ?? '';
    //     updateInputSize();
    // }, [run.title, updateInputSize]);

    // const handleTitleChange: FormEventHandler<HTMLTextAreaElement> = useCallback(
    //     (e) => {
    //         e.currentTarget.value = cleanupRunTitle(e.currentTarget.value, true);
    //         updateInputSize();
    //     },
    //     [updateInputSize],
    // );

    // const handleInputBlur = useCallback(() => {
    //     if (!textareaRef.current) return;

    //     const title = cleanupRunTitle(textareaRef.current.value);
    //     if (run.title === title) return;
    //     run.title = title;
    //     setTitleMutation.mutate({ id: run.id, title });
    // }, [run, setTitleMutation]);

    // useEffect(() => {
    //     if (!textareaRef.current) return;
    //     const resizeObserver = new ResizeObserver(updateInputSize);

    //     resizeObserver.observe(textareaRef.current);

    //     return () => {
    //         resizeObserver.disconnect();
    //     };
    // }, [updateInputSize]);

    // if (isOwnRun) {
    //     return (
    //         <Textarea
    //             ref={textareaRef}
    //             placeholder="Add title"
    //             rows={1}
    //             defaultValue={run.title ?? ''}
    //             onInput={handleTitleChange}
    //             onBlur={handleInputBlur}
    //             maxLength={MAX_RUN_TITLE_LENGTH}
    //             class={
    //                 'max-w-auto focus:bg-background focus:text-foreground relative z-[8] -mx-3 -my-3 inline-block min-h-min w-full max-w-full resize-none overflow-hidden border-none bg-transparent font-serif text-xl font-bold drop-shadow-sm md:text-2xl'
    //             }
    //         />
    //     );
    // } else if (run.title) {
    //     return (
    //         <h2 class="color-white relative z-[8] font-serif text-xl font-bold drop-shadow-sm md:text-2xl">
    //             {run.title}
    //         </h2>
    //     );
    // } else {
    //     return undefined;
    // }
};

export const RunCard: Component<{
    run: RunMetadata | GetRunResult;
    showUser?: boolean;
    isOwnRun?: boolean;
    onClick?: (runId: string) => void;
    onCombineClicked?: (runId: string) => void;
}> = (props) => {
    // TODO add mutations
    // const { toast } = useToast();

    // // deletion
    // const deletionMutation = api.run.delete.useMutation({
    //     onSuccess: () => {
    //         toast({
    //             title: 'Successfully deleted gameplay',
    //         });
    //         setIsRemoved(true);
    //     },
    //     onError: (err) => {
    //         toast({
    //             title: 'Failed to delete gameplay',
    //             description: `${err.data?.code}: ${err?.message}`,
    //         });
    //     },
    // });
    // const archiveMutation = api.run.setArchived.useMutation({
    //     onSuccess: () => {
    //         toast({
    //             title: `Successfully ${run.archived ? 'unarchived' : 'archived'} gameplay`,
    //         });
    //         setIsRemoved(true);
    //     },
    //     onError: (err) => {
    //         toast({
    //             title: `Failed to ${run.archived ? 'unarchived' : 'archived'} gameplay`,
    //             description: `${err.data?.code}: ${err?.message}`,
    //         });
    //     },
    // });

    function handleDelete() {
        // deletionMutation.mutate({ runId: run.id });
    }

    function handleArchiveToggle() {
        // archiveMutation.mutate({ runId: run.id, archived: !run.archived });
    }

    // set visibility
    const [visibility, setVisibility] = createSignal<VisibilityCode>(props.run.visibility);
    const visibilityAction = useAction(runSetVisibilityAction);
    // const visibilityActionSubmission = useSubmission(runSetVisibilityAction, ([input]) => input.id === props.run.id);

    createEffect(() => {
        setVisibility(props.run.visibility);
    });

    async function handleVisibilityChange(newVisibility: VisibilityCode) {
        setVisibility(newVisibility);
        await visibilityAction({ id: props.run.id, visibility: newVisibility });
        showToast({
            title: 'Successfully set run visibility to ' + visibilityByCode(newVisibility).name,
        });
    }

    const [isRemoved, setIsRemoved] = createSignal(false);
    // const isLoading = deletionMutation.isLoading || archiveMutation.isLoading;

    const gameState = () => props.run.gameState;
    const bgImage = () => getMapZoneHudBackground(gameState()?.mapZone);

    const isSteelSoul = () => props.run.isSteelSoul;
    const isBrokenSteelSoul = () => props.run.isBrokenSteelSoul;

    const soulOrbImgSrc = () => (isSteelSoul() ? vesselSteelSoulImg : vesselImg);
    const healthImgSrc = () => (isSteelSoul() ? steelMaskImg : maskImg);

    const VisibilityIcon = () => visibilityByCode(visibility()).Icon;

    const isLoading = () => false;

    return (
        <Expander expanded={!isRemoved()}>
            <div
                class={cn(
                    'focus-within:drop-shadow-glow-md hover:drop-shadow-glow-sm group relative mb-2 flex h-[unset] w-full flex-col items-stretch justify-between overflow-hidden rounded-3xl bg-black py-2 pl-4 pr-3 text-white transition hover:bg-black hover:text-white active:drop-shadow-none md:flex-row',
                    isRemoved() ? 'scale-125 opacity-0' : '',
                    isLoading() ? 'grayscale' : '',
                )}
            >
                {/* https://css-tricks.com/nested-links/ */}
                <Show
                    when={props.onClick}
                    fallback={<A href={`/run/${props.run.id}`} class="absolute inset-0 z-[6] block"></A>}
                >
                    {(onClick) => (
                        <button onClick={() => onClick()(props.run.id)} class="absolute inset-0 z-[6] block"></button>
                    )}
                </Show>

                <div class="flex grow flex-col">
                    <div class="-mb-4 flex flex-row items-start justify-end gap-1 sm:-mb-7">
                        {/* TODO add mutations */}
                        <RunTags
                            codes={props.run.tags}
                            runId={props.run.id}
                            isOwn={!!props.isOwnRun}
                            addButtonClass="hasHover:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
                            removeButtonClass="hasHover:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
                        />
                        <Show when={props.isOwnRun}>
                            <DropdownMenu>
                                <DropdownMenuTrigger as={Button<'button'>} class="inline-flex h-auto p-0">
                                    <Badge class={'relative z-[8] overflow-hidden'} variant="secondary">
                                        <Dynamic component={VisibilityIcon()} class="h-4 w-4" />
                                        <ChevronDown class="-mr-1 ml-1 h-3 w-3" />
                                    </Badge>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent class="w-32">
                                    <For each={visibilities}>
                                        {(visibility) => (
                                            <DropdownMenuItem onClick={() => handleVisibilityChange(visibility.code)}>
                                                <Dynamic component={visibility.Icon} class="mr-2 h-4 w-4" />
                                                <span>{visibility.name}</span>
                                            </DropdownMenuItem>
                                        )}
                                    </For>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </Show>
                    </div>
                    <div class="flex flex-grow flex-row">
                        <div class="relative z-[3] -mb-5 h-[7rem] w-[4rem] shrink-0 origin-top-left scale-75 sm:mb-0 sm:w-[6.5rem] sm:scale-100">
                            <HealthFrame isSteelSoul={isSteelSoul()} isBrokenSteelSoul={isBrokenSteelSoul()} />
                            <Show when={(gameState()?.mpReserveMax ?? 100) >= 99}>
                                <img
                                    src={soulOrbImgSrc()}
                                    alt="Soul orb"
                                    class="absolute bottom-[2.75rem] left-[-0.85rem] z-[3] scale-90"
                                />
                            </Show>
                            <Show when={(gameState()?.mpReserveMax ?? 100) >= 66}>
                                <img
                                    src={soulOrbImgSrc()}
                                    alt="Soul orb"
                                    class="absolute bottom-[1.6rem] left-[-0.4rem] z-[3] scale-95"
                                />
                            </Show>
                            <Show when={(gameState()?.mpReserveMax ?? 100) >= 33}>
                                <img
                                    src={soulOrbImgSrc()}
                                    alt="Soul orb"
                                    class="absolute bottom-[0.65rem] left-[0.5rem] z-[3]"
                                />
                            </Show>
                        </div>
                        <div class="flex grow flex-col">
                            <div class="relative z-[4] mt-4 flex flex-row flex-wrap gap-1 drop-shadow-sm sm:gap-2">
                                <Index each={[...Array(gameState()?.maxHealth ?? 5).keys()]}>
                                    {() => <img src={healthImgSrc()} alt="Health" class="-mb-1 w-5 sm:w-6" />}
                                </Index>
                            </div>
                            <div class="relative z-[4] mt-1 flex w-full flex-row gap-2 font-serif text-2xl drop-shadow-sm sm:mt-3">
                                <span>
                                    <img
                                        src={coin2Img}
                                        alt="Geo icon"
                                        class="drop-shadow-glow-md inline-block w-7 p-1"
                                    />
                                    <span class="text-xl font-semibold sm:text-2xl">{gameState()?.geo ?? '?'}</span>
                                </span>
                                <Show when={gameState()?.dreamOrbs}>
                                    <span>
                                        <img
                                            src={gameState()?.dreamNailUpgraded ? dreamNailAwokenImg : dreamNailImg}
                                            alt="Essence icon"
                                            class="drop-shadow-glow-md -mb-3 -mt-4 inline-block w-7 p-1 brightness-110 sm:w-9"
                                        />
                                        <span class="text-xl font-semibold sm:text-2xl">{gameState().dreamOrbs}</span>
                                    </span>
                                </Show>
                                <Show when={displayPercentage(gameState())}>
                                    <span class="ml-4">
                                        <span class="text-xl font-semibold sm:text-2xl">
                                            {gameState().completionPercentage}
                                        </span>
                                        %
                                    </span>
                                </Show>
                            </div>
                        </div>
                    </div>
                    <div class="-mt-3">
                        <RunTitle run={props.run} isOwnRun={props.isOwnRun ?? false} />
                        <div class="flex flex-row flex-wrap justify-start gap-4 gap-y-0 font-serif">
                            <Show when={props.run.user?.name && props.showUser}>
                                <RunCardEpicInfo title="By:" href={`/player/${props.run.user.id}`}>
                                    {props.run.user.name}
                                </RunCardEpicInfo>
                            </Show>
                            <Show when={gameState()?.playTime}>
                                {(playTime) => (
                                    <RunCardEpicInfo title="Playtime:">
                                        <Duration seconds={playTime()} />
                                    </RunCardEpicInfo>
                                )}
                            </Show>
                            <Show when={props.run.lastPlayedAt}>
                                {(lastPlayedAt) => (
                                    <RunCardEpicInfo title="Last played:">
                                        <RelativeDate date={lastPlayedAt()} withTooltip={false} />
                                    </RunCardEpicInfo>
                                )}
                            </Show>
                        </div>
                    </div>
                </div>

                {/* TODO Dropdown */}
                {/* {isOwnRun && (
                    <RunCardDropdownMenu
                        run={run}
                        handleDelete={handleDelete}
                        handleArchiveToggle={handleArchiveToggle}
                        onCombineClicked={onCombineClicked}
                    />
                )} */}

                {/* TODO */}
                {/* {run.currentUserState && <RunCardLikeButton run={run} />} */}

                {/* Background */}
                <img
                    class="l-0 t-0 absolute z-[1] h-full w-full bg-black object-cover opacity-70 group-hover:brightness-110 group-focus:brightness-110 group-active:brightness-90"
                    src={bgImage()}
                    alt="Area background image"
                />
                <div class="absolute inset-0 z-[2] bg-gradient-to-r from-black via-transparent to-black"></div>
            </div>
        </Expander>
    );
};

// TODO
// function RunCardLikeButton({ run }: { run: RunMetadata }) {
//     const [hasLiked, setHasLiked] = useState(run.currentUserState!.hasLiked);
//     const { toast } = useToast();
//     const likeMutation = api.runInteraction.like.useMutation({
//         onMutate: () => {
//             setHasLiked(true);
//         },
//         onError: (err) => {
//             toast({
//                 title: 'Failed to like',
//                 description: `${err.data?.code}: ${err?.message}`,
//             });
//             setHasLiked(false);
//         },
//     });
//     const unlikeMutation = api.runInteraction.unlike.useMutation({
//         onMutate: () => {
//             setHasLiked(false);
//         },
//         onError: (err) => {
//             toast({
//                 title: 'Failed to remove like',
//                 description: `${err.data?.code}: ${err?.message}`,
//             });
//             setHasLiked(true);
//         },
//     });

//     function handleClick() {
//         if (hasLiked) {
//             unlikeMutation.mutate({ runId: run.id });
//         } else {
//             likeMutation.mutate({ runId: run.id });
//         }
//     }

//     return (
//         <Button
//             size="icon"
//             variant="ghost"
//             aria-pressed={hasLiked}
//             aria-label={hasLiked ? 'Unlike gameplay' : 'Like gameplay'}
//             onClick={handleClick}
//             class="absolute bottom-0 right-0 z-[7] rounded-full"
//         >
//             <Star
//                 class={'h-4 w-4 transition-[fill] ' + (hasLiked ? 'fill-current' : 'fill-[rgba(255,255,255,0.001)]')}
//             />
//         </Button>
//     );
// }
function displayPercentage(
    gameState: RunMetadata['gameState'],
): gameState is RunMetadata['gameState'] & { completionPercentage: number } {
    if (!gameState) return false;

    return (
        (!!gameState.killedHollowKnight ||
            !!gameState.killedVoidIdol ||
            !!gameState.killedFinalBoss ||
            !!gameState.unlockedCompletionRate) &&
        !!gameState.completionPercentage
    );
}
