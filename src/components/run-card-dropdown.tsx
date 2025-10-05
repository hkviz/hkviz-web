import { useAction, useSubmission } from '@solidjs/router';
import { Archive, ArchiveRestore, Merge, MoreHorizontal, Split, Trash } from 'lucide-solid';
import { createSignal, Show } from 'solid-js';
import { Button } from '~/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { errorGetMessage } from '~/lib/error-get-message';
import type { RunMetadata } from '~/server/run/_find_runs_internal';
import { runUncombine } from '~/server/run/run-combine';
import { showToast } from './ui/toast';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialogDescription, AlertDialogTitle } from './ui/alert-dialog';
import { runArchive, runDelete } from '~/server/run/run-deletion';

export function RunCardDropdownMenu(props: {
	run: RunMetadata;
	handleArchiveToggle: () => void;
	handleDelete: () => void;
	onCombineClicked: undefined | null | ((runId: string) => void);
}) {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = createSignal(false);
	const [isSplitDialogOpen, setIsSplitDialogOpen] = createSignal(false);

	const uncombineAction = useAction(runUncombine);
	const uncombineSubmission = useSubmission(runUncombine);
	const deletionSubmission = useSubmission(runDelete);
	const archiveSubmission = useSubmission(runArchive);

	const isRemoving = () => deletionSubmission.pending || archiveSubmission.pending;

	async function uncombine() {
		try {
			await uncombineAction({ runId: props.run.id });
			showToast({
				title: 'Gameplays successfully split',
			});
		} catch (e) {
			showToast({
				title: 'Failed to split gameplays',
				description: errorGetMessage(e),
			});
		} finally {
			setIsSplitDialogOpen(false);
		}
	}

	// weirdly structured alert outside of dropdown bc of:
	// https://stackoverflow.com/questions/77185827/shadcn-dialog-inside-of-dropdown-closes-automatically
	// now that we are using solid-ui one could test if this is still the case

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger
					as={Button<'button'>}
					variant="ghost"
					size="icon"
					class="absolute bottom-1 right-10 z-7 flex h-6 items-center rounded-sm"
				>
					<MoreHorizontal class="h-6 w-6" />
				</DropdownMenuTrigger>
				<DropdownMenuContent class="w-56">
					<Show when={!props.run.archived}>
						<Show when={props.run.isCombinedRun}>
							<Tooltip>
								<TooltipTrigger as={DropdownMenuItem} onClick={() => setIsSplitDialogOpen(true)}>
									<Split class="mr-2 h-4 w-4" />
									<span>Split</span>
								</TooltipTrigger>
								<TooltipContent>
									Use to split the gameplay into its original parts, after it was wrongly combined.
								</TooltipContent>
							</Tooltip>
						</Show>
						<Show when={props.onCombineClicked}>
							{(onCombineClicked) => (
								<Tooltip>
									<TooltipTrigger
										as={DropdownMenuItem}
										onClick={() => onCombineClicked()(props.run.id)}
									>
										<Merge class="mr-2 h-4 w-4" />
										<span>Combine</span>
									</TooltipTrigger>
									<TooltipContent>
										Use combine to merge a single gameplay, which has wrongly been created as
										multiple.
									</TooltipContent>
								</Tooltip>
							)}
						</Show>
						<DropdownMenuSeparator />
					</Show>
					<Show when={props.run.archived}>
						<DropdownMenuItem onClick={props.handleArchiveToggle}>
							<ArchiveRestore class="mr-2 h-4 w-4" />
							<span>Unarchive</span>
						</DropdownMenuItem>
					</Show>
					<Show when={!props.run.archived}>
						<DropdownMenuItem onClick={props.handleArchiveToggle}>
							<Archive class="mr-2 h-4 w-4" />
							<span>Archive</span>
						</DropdownMenuItem>
					</Show>
					<DropdownMenuGroup>
						<DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
							<Trash class="mr-2 h-4 w-4" />
							<span>Delete</span>
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
			{/* Delete dialog */}
			<Dialog open={isDeleteDialogOpen()} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							<Show when={props.run.archived} fallback={<>Delete or Archive this gameplay?</>}>
								Delete this run permanently?
							</Show>
						</DialogTitle>
						<DialogDescription>
							<ul class="list-disc pl-5">
								<li>
									<b class="text-bold">Delete can not be undone</b>, your data will be deleted
									permanently. <br />
									Playing again on this profile while using the mod, will create a new gamplay without
									the previous data.
								</li>
								<Show when={!props.run.archived}>
									<li>
										<b class="text-bold">Archive</b> will hide this gameplay from your gameplays and
										other views, you can still view it inside your archive. <br />
										Playing again on this profile while using the mod, will record the data into
										your archive.
									</li>
								</Show>
							</ul>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isRemoving()}>
							Cancel
						</Button>
						<Show when={!props.run.archived}>
							<Button onClick={props.handleArchiveToggle} disabled={isRemoving()}>
								{props.run.archived ? 'Unarchive' : 'Archive'}
							</Button>
						</Show>
						<Button onClick={props.handleDelete} disabled={isRemoving()}>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			{/* Split dialog */}
			<Dialog open={isSplitDialogOpen()} onOpenChange={setIsSplitDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<AlertDialogTitle>
							Split all already combined gameplays into individual gameplays?
						</AlertDialogTitle>
						<AlertDialogDescription>
							You can combine parts of the gameplays again later.
						</AlertDialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsSplitDialogOpen(false)}
							disabled={uncombineSubmission.pending}
						>
							Cancel
						</Button>
						<Button onClick={uncombine} disabled={uncombineSubmission.pending}>
							Split
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
