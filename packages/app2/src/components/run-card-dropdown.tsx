import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { Archive, ArchiveRestore, Merge, MoreHorizontal, Split, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { type RunMetadata } from '~/server/api/routers/run/runs-find';
import { api } from '~/trpc/react';

export function RunCardDropdownMenu({
    run,
    handleArchiveToggle,
    handleDelete,
    onCombineClicked,
}: {
    run: RunMetadata;
    handleArchiveToggle: () => void;
    handleDelete: () => void;
    onCombineClicked: undefined | null | ((runId: string) => void);
}) {
    const { toast } = useToast();
    const router = useRouter();

    const uncombineMutation = api.run.uncombine.useMutation({
        onSuccess: () => {
            toast({
                title: 'Gameplays successfully split',
            });
            router.refresh();
        },
        onError: (error) => {
            console.log('failed to split gameplays', error);
            toast({
                title: 'Failed to split gameplays',
                description: error.message,
            });
        },
    });

    function handleSplit() {
        uncombineMutation.mutate({ runId: run.id });
    }

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isSplitDialogOpen, setIsSplitDialogOpen] = useState(false);

    // weirdly structured alert outside of dropdown bc of:
    // https://stackoverflow.com/questions/77185827/shadcn-dialog-inside-of-dropdown-closes-automatically
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        class="absolute bottom-1 right-[2.5rem] z-[7] flex h-6 items-center rounded-sm"
                    >
                        <MoreHorizontal class="h-6 w-6" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="-top-2 w-56" side="top" align="end" alignOffset={-10}>
                    {!run.archived && (
                        <>
                            {run.isCombinedRun && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <DropdownMenuItem onClick={() => setIsSplitDialogOpen(true)}>
                                            <Split class="mr-2 h-4 w-4" />
                                            <span>Split</span>
                                        </DropdownMenuItem>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Use to split the gameplay into its original parts, after it was wrongly
                                        combined.
                                    </TooltipContent>
                                </Tooltip>
                            )}
                            {onCombineClicked && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <DropdownMenuItem onClick={() => onCombineClicked(run.id)}>
                                            <Merge class="mr-2 h-4 w-4" />
                                            <span>Combine</span>
                                        </DropdownMenuItem>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Use combine to merge a single gameplay, which has wrongly been created as
                                        multiple.
                                    </TooltipContent>
                                </Tooltip>
                            )}
                            <DropdownMenuSeparator />
                        </>
                    )}
                    {run.archived && (
                        <DropdownMenuItem onClick={handleArchiveToggle}>
                            <ArchiveRestore class="mr-2 h-4 w-4" />
                            <span>Unarchive</span>
                        </DropdownMenuItem>
                    )}
                    {!run.archived && (
                        <DropdownMenuItem onClick={handleArchiveToggle}>
                            <Archive class="mr-2 h-4 w-4" />
                            <span>Archive</span>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
                            <Trash class="mr-2 h-4 w-4" />
                            <span>Delete</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            {/* Delete dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {run.archived ? 'Delete this run completely?' : 'Delete or Archive this gameplay?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            <ul class="list-disc pl-5">
                                <li>
                                    <b class="text-bold">Delete can not be undone</b>, your data will be deleted
                                    completely. <br />
                                    Playing again on this profile while using the mod, will create a new gamplay without
                                    the previous data.
                                </li>
                                {!run.archived && (
                                    <li>
                                        <b class="text-bold">Archive</b> will hide this gameplay from your gameplays and
                                        other views, you can still view it inside your archive. <br />
                                        Playing again on this profile while using the mod, will record the data into
                                        your archive.
                                    </li>
                                )}
                            </ul>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        {!run.archived && (
                            <AlertDialogAction onClick={handleArchiveToggle}>
                                {run.archived ? 'Unarchive' : 'Archive'}
                            </AlertDialogAction>
                        )}
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {/* Split dialog */}
            <AlertDialog open={isSplitDialogOpen} onOpenChange={setIsSplitDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Split all already combined gameplays into individual gameplays?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            You can combine parts of the gameplays again later.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSplit}>Split</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
