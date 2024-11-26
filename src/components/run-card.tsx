import { A, useAction, useSubmission } from '@solidjs/router';
import { ChevronDown, Heart } from 'lucide-solid';
import { For, Index, Match, Show, Switch, createEffect, createSignal, type Component, type JSXElement } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { errorGetMessage } from '~/lib/error-get-message';
import { MAX_RUN_TITLE_LENGTH, cleanupRunTitle } from '~/lib/types/run-fields';
import { visibilities, visibilityByCode, type VisibilityCode } from '~/lib/types/visibility';
import { cn } from '~/lib/utils';
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
} from '~/lib/viz';
import { type RunMetadata } from '~/server/run/_find_runs_internal';
import { type GetRunResult } from '~/server/run/run-get';
import { runInteractionLike, runInteractionUnlike } from '~/server/run/run-interaction';
import { runSetTitleAction } from '~/server/run/run-set-title';
import { runSetVisibilityAction } from '~/server/run/run-set-visibility';
import { getMapZoneHudBackground } from './area-background';
import { RunTags } from './run-tags';
import { Expander } from './ui/additions';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { TextField, TextFieldTextArea } from './ui/text-field';
import { showToast } from './ui/toast';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { runArchive, runDelete } from '~/server/run/run-deletion';
import { RunCardDropdownMenu } from './run-card-dropdown';

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
				<A href={href()} class="z-[7] hover:underline hover:drop-shadow-glow-md">
					{spans}
				</A>
			)}
		</Show>
	);
};

const RunTitle: Component<{ run: RunMetadata; isOwnRun: boolean }> = (props) => {
	const [title, setTitle] = createSignal(props.run.title);
	createEffect(() => {
		setTitle(props.run.title);
	});

	const setTitleAction = useAction(runSetTitleAction);
	const titleSubmission = useSubmission(runSetTitleAction, ([input]) => input.id === props.run.id);

	let textareaRef!: HTMLTextAreaElement;

	const updateInputSize = () => {
		if (textareaRef) {
			textareaRef.style.width = `min(${Math.max(textareaRef.value.length * 1.5 + 5, 10)}ch, 100%)`;
			textareaRef.style.height = 'auto';
			textareaRef.style.height = textareaRef.scrollHeight + 'px';
		}
	};

	createEffect(() => {
		if (!textareaRef) return;
		textareaRef.value = props.run.title ?? '';
		updateInputSize();
	});

	const handleTitleChange = (e: InputEvent) => {
		textareaRef.value = cleanupRunTitle(textareaRef.value, true);
		updateInputSize();
	};

	const handleInputBlur = async () => {
		if (!textareaRef) return;

		const newTitle = cleanupRunTitle(textareaRef.value);
		if (title() === newTitle) return;
		setTitle(newTitle);
		try {
			const result = await setTitleAction({ id: props.run.id, title: newTitle });
			showToast({
				title: 'Successfully updated title',
			});
		} catch (ex) {
			showToast({
				title: 'Failed to update title',
				description: (ex as Error)?.message,
			});
		}
	};

	createEffect(() => {
		if (!textareaRef) return;
		const resizeObserver = new ResizeObserver(updateInputSize);

		resizeObserver.observe(textareaRef);

		return () => {
			resizeObserver.disconnect();
		};
	});

	return (
		<>
			<Show when={props.isOwnRun}>
				<TextField>
					<TextFieldTextArea
						ref={textareaRef}
						placeholder="Add title"
						rows={1}
						onInput={handleTitleChange}
						onBlur={handleInputBlur}
						maxLength={MAX_RUN_TITLE_LENGTH}
						disabled={titleSubmission.pending}
						class={
							'max-w-auto relative z-[8] -mx-3 -my-3 inline-block min-h-min w-full max-w-full resize-none overflow-hidden border-none bg-transparent font-serif text-xl font-bold drop-shadow-sm focus:bg-background focus:text-foreground md:text-2xl'
						}
					>
						{title()}
					</TextFieldTextArea>
				</TextField>
			</Show>
			<Show when={!props.isOwnRun && props.run.title}>
				<h2 class="color-white relative z-[8] font-serif text-xl font-bold drop-shadow-sm md:text-2xl">
					{props.run.title}
				</h2>
			</Show>
		</>
	);
};

export const RunCard: Component<{
	run: RunMetadata | GetRunResult;
	showUser?: boolean;
	isOwnRun?: boolean;
	onClick?: (runId: string) => void;
	onCombineClicked?: (runId: string) => void;
}> = (props) => {
	const deleteAction = useAction(runDelete);
	const deleteSubmission = useSubmission(runDelete, ([input]) => input.runId === props.run.id);
	const archiveAction = useAction(runArchive);
	const archiveSubmission = useSubmission(runArchive, ([input]) => input.runId === props.run.id);

	const [isRemoved, setIsRemoved] = createSignal(false);

	async function handleDelete() {
		try {
			await deleteAction({ runId: props.run.id });
			showToast({
				title: 'Successfully deleted gameplay',
			});
			setIsRemoved(true);
		} catch (err) {
			showToast({
				title: 'Failed to delete gameplay',
				description: errorGetMessage(err),
			});
		}
	}

	async function handleArchiveToggle() {
		try {
			await archiveAction({ runId: props.run.id, archived: !props.run.archived });
			showToast({
				title: `Successfully ${props.run.archived ? 'unarchived' : 'archived'} gameplay`,
			});
			setIsRemoved(true);
		} catch (err) {
			showToast({
				title: `Failed to ${props.run.archived ? 'unarchived' : 'archived'} gameplay`,
				description: errorGetMessage(err),
			});
		}
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

	// const isLoading = deletionMutation.isLoading || archiveMutation.isLoading;

	const gameState = () => props.run.gameState;
	const bgImage = () => getMapZoneHudBackground(gameState()?.mapZone);

	const isSteelSoul = () => props.run.isSteelSoul;
	const isBrokenSteelSoul = () => props.run.isBrokenSteelSoul;

	const soulOrbImgSrc = () => (isSteelSoul() ? vesselSteelSoulImg : vesselImg);
	const healthImgSrc = () => (isSteelSoul() ? steelMaskImg : maskImg);

	const visibilityIcon = () => visibilityByCode(visibility()).Icon;

	const isRemoving = () => false; // deleteSubmission.pending || archiveSubmission.pending;

	return (
		<Expander expanded={!isRemoved()} class="overflow-auto">
			<div
				class={cn(
					'group relative mb-2 flex h-[unset] w-full flex-col items-stretch justify-between overflow-hidden rounded-3xl bg-black py-2 pl-4 pr-3 text-white transition focus-within:drop-shadow-glow-md hover:bg-black hover:text-white hover:drop-shadow-glow-sm active:drop-shadow-none md:flex-row',
					isRemoved() ? 'scale-125 opacity-0' : '',
					isRemoving() ? 'grayscale' : '',
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
										<Dynamic component={visibilityIcon()} class="h-4 w-4" />
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
										class="inline-block w-7 p-1 drop-shadow-glow-md"
									/>
									<span class="text-xl font-semibold sm:text-2xl">{gameState()?.geo ?? '?'}</span>
								</span>
								<Show when={gameState()?.dreamOrbs}>
									<span>
										<img
											src={gameState()?.dreamNailUpgraded ? dreamNailAwokenImg : dreamNailImg}
											alt="Essence icon"
											class="-mb-3 -mt-4 inline-block w-7 p-1 brightness-110 drop-shadow-glow-md sm:w-9"
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

				<Show when={props.isOwnRun}>
					<RunCardDropdownMenu
						run={props.run}
						handleDelete={handleDelete}
						handleArchiveToggle={handleArchiveToggle}
						onCombineClicked={props.onCombineClicked}
					/>
				</Show>

				<Show when={props.run.currentUserState}>
					<RunCardLikeButton run={props.run} />
				</Show>
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
function RunCardLikeButton({ run }: { run: RunMetadata }) {
	const [hasLiked, setHasLiked] = createSignal(run.currentUserState!.hasLiked);
	const likeAction = useAction(runInteractionLike);
	const unlikeAction = useAction(runInteractionUnlike);
	const likeSubmission = useSubmission(runInteractionLike, ([input]) => input.runId === run.id);
	const unlikeSubmission = useSubmission(runInteractionUnlike, ([input]) => input.runId === run.id);
	const isSubmitting = () => likeSubmission.pending || unlikeSubmission.pending;

	async function like() {
		try {
			setHasLiked(true);
			await likeAction({ runId: run.id });
		} catch (err) {
			showToast({
				title: 'Failed to like',
				description: errorGetMessage(err),
			});
			setHasLiked(false);
		}
	}

	async function unlike() {
		try {
			setHasLiked(false);
			await unlikeAction({ runId: run.id });
		} catch (err) {
			showToast({
				title: 'Failed to unlike',
				description: errorGetMessage(err),
			});
			setHasLiked(true);
		}
	}

	function handleClick() {
		if (hasLiked()) {
			unlike();
		} else {
			like();
		}
	}

	return (
		<Tooltip>
			<TooltipTrigger
				as={Button}
				size="icon"
				variant="ghost"
				aria-pressed={hasLiked()}
				onClick={handleClick}
				disabled={isSubmitting()}
				class="group absolute bottom-0 right-0 z-[7] rounded-full"
			>
				<Heart
					class={
						'h-4 w-4 transition-[fill] group-hover:drop-shadow-glow-md ' +
						(hasLiked() ? 'fill-current' : 'fill-[rgba(255,255,255,0.001)]')
					}
				/>
			</TooltipTrigger>
			<TooltipContent>{hasLiked() ? 'Unlike gameplay' : 'Like gameplay'}</TooltipContent>
		</Tooltip>
	);
}

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
