'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Plus, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { tagFromCode, tagGroups, ungroupedTags, type Tag, type TagCode } from '~/lib/types/tags';
import { api } from '~/trpc/react';

export function RunTag({
    tag,
    runId,
    isOwn,
    onRemovedTag,
}: {
    tag: Tag;
    runId: string;
    isOwn: boolean;
    onRemovedTag?: (tag: Tag) => void;
}) {
    const removeTagMutation = api.run.removeTag.useMutation();

    async function removeTag() {
        await removeTagMutation.mutateAsync({ id: runId, code: tag.code });
        onRemovedTag?.(tag);
    }

    return (
        <Badge
            className={cn(
                'relative z-[8] overflow-hidden',
                tag.color.className,
                removeTagMutation.isLoading ? 'bg-zinc-700 hover:bg-zinc-700' : '',
            )}
        >
            <span className="font-bold">{tag.name}</span>
            {isOwn && (
                <Button
                    variant="ghost"
                    className="relative -m-2 -mr-3 ml-2 h-8 w-8 rounded-full"
                    size="icon"
                    onClick={removeTag}
                    disabled={removeTagMutation.isSuccess}
                >
                    <X className="h-3 w-3" />
                </Button>
            )}
        </Badge>
    );
}

export function RunTags({
    codes: initialCodes,
    runId,
    isOwn,
    className,
}: {
    codes: TagCode[];
    runId: string;
    isOwn: boolean;
    className?: string;
}) {
    const [codes, setCodes] = useState<TagCode[]>(initialCodes);
    const runTags = useMemo(() => codes.map(tagFromCode).sort((a, b) => a.order - b.order), [codes]);

    const addTagMutation = api.run.addTag.useMutation();

    async function addTag(tag: Tag) {
        await addTagMutation.mutateAsync({ id: runId, code: tag.code });
        setCodes([...codes, tag.code]);
    }

    function onRemovedTag(tag: Tag) {
        setCodes(codes.filter((code) => code !== tag.code));
    }

    return (
        <div className={cn('flex flex-row flex-wrap gap-1 font-sans', className)}>
            <ul className="flex flex-row flex-wrap gap-1">
                {runTags.map((tag) => (
                    <li key={tag.code} className="w-fit">
                        <RunTag tag={tag} runId={runId} isOwn={isOwn} onRemovedTag={onRemovedTag} />
                    </li>
                ))}
                {addTagMutation.isLoading && (
                    <li>
                        <Skeleton className="relative z-[8] h-6 w-[4rem]" />
                    </li>
                )}
                {isOwn && (
                    <li>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    aria-label="Add tag"
                                    size="icon"
                                    className="relative z-[8] h-8 w-8 rounded-full"
                                >
                                    <Plus />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuGroup>
                                    {tagGroups.map((group) => (
                                        <DropdownMenuSub key={group.code}>
                                            <DropdownMenuSubTrigger>
                                                <span>{group.name}</span>
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuPortal>
                                                <DropdownMenuSubContent>
                                                    {group.tags.map((tag) => (
                                                        <DropdownMenuItem
                                                            key={tag.code}
                                                            onClick={() => addTag(tag)}
                                                            disabled={codes.includes(tag.code)}
                                                        >
                                                            <Badge className={tag.color.className}>{tag.name}</Badge>
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuSubContent>
                                            </DropdownMenuPortal>
                                        </DropdownMenuSub>
                                    ))}
                                    {ungroupedTags.map((tag) => (
                                        <DropdownMenuItem
                                            key={tag.code}
                                            onClick={() => addTag(tag)}
                                            disabled={codes.includes(tag.code)}
                                        >
                                            <Badge className={tag.color.className}>{tag.name}</Badge>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </li>
                )}
            </ul>
        </div>
    );
}
