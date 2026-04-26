import { useAction, useSubmission } from '@solidjs/router';
import { ChevronDownIcon, HeartIcon } from 'lucide-solid';
import { type Component, createEffect, createSignal, For, Index, type JSXElement, Show } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { RunCardFrameHollow } from '~/components/run-card/run-card-frame-hollow.tsx';
import { RunCardFrameSilk } from '~/components/run-card/run-card-frame-silk.tsx';
import { RunCardTitle } from '~/components/run-card/run-card-title.tsx';
import { createMutableMemo } from '~/lib/create-mutable-memo';
import { errorGetMessage } from '~/lib/error-get-message';
import { AA } from '~/lib/routing/AA';
import { UrlPath } from '~/lib/routing/url';
import { visibilities, visibilityByCode, type VisibilityCode } from '~/lib/types/visibility';
import { assertNever } from '~/lib/util/other';
import { cn } from '~/lib/utils';
import {
	coin2 as coin2Img,
	dreamNailAwokenImg,
	dreamNailImg,
	hornetHealthImg,
	maskImg,
	RelativeDate,
	rosaryHudImg,
	shellShardImg,
	steelMaskImg,
	vesselImg,
	vesselSteelSoul as vesselSteelSoulImg,
} from '~/lib/viz';
import { type RunMetadata } from '~/server/run/_find_runs_internal';
import { runArchive, runDelete } from '~/server/run/run-deletion';
import { type GetRunResult } from '~/server/run/run-get';
import { runInteractionLike, runInteractionUnlike } from '~/server/run/run-interaction';
import { runSetVisibilityAction } from '~/server/run/run-set-visibility';
import { RunCardDropdownMenu } from '../run-card-dropdown';
import { Expander } from '../ui/additions';
import { createFocusContext, FocusContext, useGlobalMenuContext } from '../ui/additions/focus-context.tsx';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { showToast } from '../ui/toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { RunCardBackground } from './run-card-background.tsx';
import { RunCardTags } from './run-card-tags.tsx';

function Duration(props: { seconds: number }) {
	const duration = () => {
		const hours = Math.floor(props.seconds / 60 / 60);
		const minutes = Math.floor((props.seconds / 60) % 60);

		const d = [];
		if (hours > 0) d.push(`${hours}h`);
		if (minutes > 0) d.push(`${minutes}m`);
		return d.length === 0 ? '0m' : d.join(' ');
	};

	return <span>{duration()}</span>;
}

const RunCardEpicInfo: Component<{
	title: JSXElement;
	class?: string;
	href?: UrlPath;
	children: JSXElement;
}> = (props) => {
	const spans = (
		<span class={cn('z-4 flex flex-row items-baseline gap-1 drop-shadow-xs', props.class)}>
			<span class="text-xs md:text-sm">{props.title}</span>
			<span class="text-sm font-bold md:text-base">{props.children}</span>
		</span>
	);

	return (
		<Show when={props.href} fallback={spans}>
			{(href) => (
				<AA href={href()} class="hover:drop-shadow-glow-md z-7 hover:underline">
					{spans}
				</AA>
			)}
		</Show>
	);
};

export const RunCard: Component<{
	run: RunMetadata | GetRunResult;
	showUser?: boolean;
	isOwnRun?: boolean;
	onClick?: (run: RunMetadata) => void;
	onCombineClicked?: (run: RunMetadata) => void;
	isSelected?: boolean;
	gray?: boolean;
}> = (props) => {
	const deleteAction = useAction(runDelete);
	const _deleteSubmission = useSubmission(runDelete, ([input]) => input.runId === props.run.id);
	const archiveAction = useAction(runArchive);
	const _archiveSubmission = useSubmission(runArchive, ([input]) => input.runId === props.run.id);

	const [isRemoved, setIsRemoved] = createSignal(false);

	async function handleDelete() {
		try {
			setIsRemoved(true);
			await deleteAction({ runId: props.run.id });
			showToast({
				title: 'Successfully deleted gameplay',
			});
		} catch (err) {
			setIsRemoved(false);
			showToast({
				title: 'Failed to delete gameplay',
				description: errorGetMessage(err),
			});
		}
	}

	async function handleArchiveToggle() {
		try {
			setIsRemoved(true);
			await archiveAction({ runId: props.run.id, archived: !props.run.archived });
			showToast({
				title: `Successfully ${props.run.archived ? 'unarchived' : 'archived'} gameplay`,
			});
		} catch (err) {
			setIsRemoved(false);
			showToast({
				title: `Failed to ${props.run.archived ? 'unarchived' : 'archived'} gameplay`,
				description: errorGetMessage(err),
			});
		}
	}

	// set visibility
	const [visibility, setVisibility] = createMutableMemo<VisibilityCode>(() => props.run.visibility);
	const visibilityAction = useAction(runSetVisibilityAction);
	const visibilityActionSubmission = useSubmission(runSetVisibilityAction, ([input]) => input.id === props.run.id);

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
	const gameStateAsSilk = () => (props.run.gameState.game === 'silk' ? props.run.gameState : null);
	const gameStateAsHollow = () => (props.run.gameState.game === 'hollow' ? props.run.gameState : null);

	const isSteelSoul = () => props.run.isSteelSoul;
	const isBrokenSteelSoul = () => props.run.isBrokenSteelSoul;

	const soulOrbImgSrc = () => (isSteelSoul() ? vesselSteelSoulImg : vesselImg);
	const healthImgSrc = () => {
		const game = gameState()?.game;
		if (game === 'hollow') {
			return isSteelSoul() ? steelMaskImg : maskImg;
		} else if (game === 'silk') {
			return isSteelSoul() ? hornetHealthImg : hornetHealthImg;
		} else {
			return assertNever(game);
		}
	};

	const visibilityIcon = () => visibilityByCode(visibility()).Icon;

	const isRemoving = () => false; // deleteSubmission.pending || archiveSubmission.pending;

	//props.run.gameState.game = 'silk';

	const focusContext = createFocusContext();
	const globalMenuContext = useGlobalMenuContext();

	return (
		<FocusContext.Provider value={focusContext}>
			<Expander expanded={!isRemoved()} class="isolate overflow-visible">
				<div
					class={cn(
						'group focus-within:drop-shadow-glow-md hover:drop-shadow-glow-sm relative mb-2 flex h-[unset] min-h-30 w-full flex-col items-stretch justify-between overflow-hidden rounded-3xl py-2 pr-3 pl-4 text-white transition hover:bg-black hover:text-white active:drop-shadow-none md:flex-row',
						isRemoved() ? 'scale-125 opacity-0' : '',
						isRemoving() || props.gray ? 'opacity-80 brightness-75 contrast-90 grayscale' : '',
						props.isSelected ? 'ring-2 ring-primary' : '',
					)}
					{...focusContext.focusedAttributes()}
				>
					<RunCardBackground run={props.run} />
					{/* https://css-tricks.com/nested-links/ */}
					<Show when={!globalMenuContext.hasFocus()}>
						{/* Because of a safari bug (i think), the link sometimes is the click target on ios
						when a context menu item in front of the link is clicked. Thats why the link is removed
						a context menu is open */}
						<Show
							when={props.onClick}
							fallback={<AA href={`/run/${props.run.id}`} class="absolute inset-0 z-6 block" />}
						>
							{(onClick) => (
								<button onClick={() => onClick()(props.run)} class="absolute inset-0 z-6 block" />
							)}
						</Show>
					</Show>

					<div class="flex grow flex-col">
						<div class="-mb-4 flex flex-row items-start justify-end gap-1 sm:-mb-7">
							{/* TODO add mutations */}
							<RunCardTags
								runGame={props.run.gameState.game}
								codes={props.run.tags}
								runId={props.run.id}
								isOwn={Boolean(props.isOwnRun)}
								addButtonClass="hasHover:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 hasHover:scale-90 group-hover:scale-100 group-focus-within:scale-100 transition origin-right group-data-focus-context:opacity-100 group-data-focus-context:scale-100"
								removeButtonClass="hasHover:opacity-0 hasHover:w-4 group-hover:w-8 group-data-focus-context:w-8 group-focus-within:w-8 -ml-1 transition-all group-hover:opacity-100 group-focus-within:opacity-100 group-data-focus-context:opacity-100"
							/>
							<Show when={props.isOwnRun}>
								<DropdownMenu>
									<DropdownMenuTrigger
										as={Button<'button'>}
										class="z-8 inline-flex h-auto p-0 disabled:z-8"
										disabled={visibilityActionSubmission.pending}
									>
										<Badge class={'relative overflow-hidden disabled:z-8'} variant="secondary">
											<Dynamic component={visibilityIcon()} class="h-4 w-4" />
											<ChevronDownIcon class="-mr-1 ml-1 h-3 w-3" />
										</Badge>
									</DropdownMenuTrigger>
									<DropdownMenuContent class="w-32">
										<For each={visibilities}>
											{(visibility) => (
												<DropdownMenuItem
													onSelect={() => handleVisibilityChange(visibility.code)}
												>
													<Dynamic component={visibility.Icon} class="mr-2 h-4 w-4" />
													<span>{visibility.name}</span>
												</DropdownMenuItem>
											)}
										</For>
									</DropdownMenuContent>
								</DropdownMenu>
							</Show>
						</div>
						<div class="flex grow flex-row">
							<div class="relative -mb-5 h-28 w-16 shrink-0 origin-top-left scale-75 sm:mb-0 sm:w-26 sm:scale-100">
								<Show when={gameStateAsSilk()}>
									{(gs) => (
										<RunCardFrameSilk
											isSteelSoul={isSteelSoul()}
											isBrokenSteelSoul={isBrokenSteelSoul()}
											crestName={gs().currentCrestId}
										/>
									)}
								</Show>
								<Show when={props.run.gameState.game === 'hollow'}>
									<RunCardFrameHollow
										isSteelSoul={isSteelSoul()}
										isBrokenSteelSoul={isBrokenSteelSoul()}
									/>
								</Show>
								<Show when={gameStateAsHollow()}>
									{(gameState) => (
										<>
											<Show when={(gameState()?.mpReserveMax ?? 100) >= 99}>
												<img
													src={soulOrbImgSrc()}
													alt="Soul orb"
													class="absolute bottom-11 left-[-0.85rem] scale-90"
												/>
											</Show>
											<Show when={(gameState()?.mpReserveMax ?? 100) >= 66}>
												<img
													src={soulOrbImgSrc()}
													alt="Soul orb"
													class="absolute bottom-[1.6rem] left-[-0.4rem] scale-95"
												/>
											</Show>
											<Show when={(gameState()?.mpReserveMax ?? 100) >= 33}>
												<img
													src={soulOrbImgSrc()}
													alt="Soul orb"
													class="absolute bottom-[0.65rem] left-2"
												/>
											</Show>
										</>
									)}
								</Show>
							</div>
							<div class="flex grow flex-col">
								<div
									class={cn(
										'relative mt-4 flex flex-row flex-wrap gap-1 drop-shadow-xs sm:gap-2',
										gameState().game === 'silk' ? '-translate-x-2 translate-y-1' : '',
									)}
								>
									<Index each={[...Array(gameState()?.maxHealth ?? 5).keys()]}>
										{() => <img src={healthImgSrc()} alt="Health" class="-mb-1 w-5 sm:w-6" />}
									</Index>
								</div>
								<div class="relative mt-1 flex w-full flex-row gap-2 font-serif text-2xl drop-shadow-xs sm:mt-3">
									<span>
										<img
											src={props.run.gameState.game === 'silk' ? rosaryHudImg : coin2Img}
											alt={props.run.gameState.game === 'silk' ? 'Rosary icon' : 'Geo icon'}
											class={cn(
												'drop-shadow-glow-md inline-block p-1',
												props.run.gameState.game === 'silk' ? 'w-8' : 'w-7',
											)}
										/>
										<span class="text-xl font-semibold sm:text-2xl">{gameState()?.geo ?? '?'}</span>
									</span>
									<Show when={gameStateAsHollow() && gameStateAsHollow()?.dreamOrbs}>
										{(dreamOrbs) => (
											<span>
												<img
													src={
														gameStateAsHollow()?.dreamNailUpgraded
															? dreamNailAwokenImg
															: dreamNailImg
													}
													alt={gameState().game === 'silk' ? 'Shell Shards' : '"Essence'}
													class="drop-shadow-glow-md -mt-4 -mb-3 inline-block w-7 p-1 brightness-110 sm:w-9"
												/>
												<span class="text-xl font-semibold sm:text-2xl">{dreamOrbs()}</span>
											</span>
										)}
									</Show>
									<Show when={gameStateAsSilk()}>
										{(gs) => (
											<span>
												<img
													src={shellShardImg}
													alt={gameState().game === 'silk' ? 'Shell Shards' : '"Essence'}
													class="drop-shadow-glow-md -mt-4 -mb-3 inline-block w-7 p-1 brightness-110 sm:w-9"
												/>
												<span class="text-xl font-semibold sm:text-2xl">
													{gs().shellShards}
												</span>
											</span>
										)}
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
							<RunCardTitle run={props.run} isOwnRun={props.isOwnRun ?? false} />
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
				</div>
			</Expander>
		</FocusContext.Provider>
	);
};

// TODO
function RunCardLikeButton(props: { run: RunMetadata }) {
	// eslint-disable-next-line solid/reactivity
	const [hasLiked, setHasLiked] = createSignal(props.run.currentUserState!.hasLiked);
	const likeAction = useAction(runInteractionLike);
	const unlikeAction = useAction(runInteractionUnlike);
	const likeSubmission = useSubmission(runInteractionLike, ([input]) => input.runId === props.run.id);
	const unlikeSubmission = useSubmission(runInteractionUnlike, ([input]) => input.runId === props.run.id);
	const isSubmitting = () => likeSubmission.pending || unlikeSubmission.pending;

	async function like() {
		try {
			setHasLiked(true);
			await likeAction({ runId: props.run.id });
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
			await unlikeAction({ runId: props.run.id });
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
			void unlike();
		} else {
			void like();
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
				class="group absolute right-0 bottom-0 z-7 rounded-full"
			>
				<HeartIcon
					class={
						'group-hover:drop-shadow-glow-md h-4 w-4 transition-[fill] duration-300 ' +
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
	if (gameState?.completionPercentage == null) {
		return false;
	}
	if (gameState.unlockedCompletionRate === true) {
		return true;
	}
	if (gameState.game === 'hollow') {
		return (
			gameState.killedHollowKnight === true ||
			gameState.killedVoidIdol === true ||
			gameState.killedFinalBoss === true
		);
	} else if (gameState.game === 'silk') {
		return (
			gameState.endingAct2Regular === true ||
			gameState.endingAct2Cursed === true ||
			gameState.endingAct2SoulSnare === true ||
			gameState.endingAct3 === true
		);
	} else {
		return assertNever(gameState);
	}
}
