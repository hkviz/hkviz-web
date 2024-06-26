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
import { useEffect, useMemo, useState } from 'react';
import { tagFromCode, tagGroups, ungroupedTags, type Tag, type TagCode, type TagGroup } from '~/lib/types/tags';
import { api } from '~/trpc/react';

export function RunTag({
    tag,
    runId,
    isOwn,
    onRemovedTag,
    removeButtonClassName,
}: {
    tag: Tag;
    runId: string;
    isOwn: boolean;
    onRemovedTag?: (tag: Tag) => void;
    removeButtonClassName?: string;
}) {
    const setTagMutation = api.run.setTag.useMutation();

    async function removeTag() {
        await setTagMutation.mutateAsync({ id: runId, code: tag.code, hasTag: false });
        onRemovedTag?.(tag);
    }

    return (
        <Badge
            className={cn(
                'relative z-[8] overflow-hidden',
                tag.color.className,
                setTagMutation.isLoading ? 'bg-zinc-700 hover:bg-zinc-700' : '',
            )}
        >
            <span className="font-bold">{tag.name}</span>
            {isOwn && (
                <Button
                    variant="ghost"
                    className={cn('relative -m-2 -mr-3 ml-0 h-8 w-8 rounded-full', removeButtonClassName)}
                    size="icon"
                    onClick={removeTag}
                    disabled={setTagMutation.isSuccess}
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
    addButtonClassName,
    removeButtonClassName,
}: {
    codes: TagCode[];
    runId: string;
    isOwn: boolean;
    className?: string;
    addButtonClassName?: string;
    removeButtonClassName?: string;
}) {
    const [codes, setCodes] = useState<TagCode[]>(initialCodes);
    const runTags = useMemo(() => codes.map(tagFromCode).sort((a, b) => a.order - b.order), [codes]);

    useEffect(() => {
        setCodes(initialCodes);
    }, [initialCodes]);

    const setTagMutation = api.run.setTag.useMutation();

    async function addTag(tag: Tag) {
        if (codes.includes(tag.code)) return;
        await setTagMutation.mutateAsync({ id: runId, code: tag.code, hasTag: true });
        setCodes([...codes, tag.code]);
    }

    function onRemovedTag(tag: Tag) {
        setCodes(codes.filter((code) => code !== tag.code));
    }

    return (
        <div className={cn('items-[start] flex min-h-6 flex-row flex-wrap gap-1 font-sans', className)}>
            <ul className="flex flex-row flex-wrap-reverse items-end justify-end gap-1">
                {isOwn && (
                    <li>
                        <TagDropdownMenu onClick={addTag}>
                            <Button
                                variant="outline"
                                size="sm"
                                className={cn(
                                    'relative z-[8] h-auto rounded-full px-2 py-1 text-xs text-black dark:text-white',
                                    addButtonClassName,
                                )}
                            >
                                <Plus className="h-4 w-4" />
                                Add Tag
                            </Button>
                        </TagDropdownMenu>
                    </li>
                )}
                {runTags.map((tag) => (
                    <li key={tag.code} className="flex w-fit flex-row">
                        <RunTag
                            tag={tag}
                            runId={runId}
                            isOwn={isOwn}
                            onRemovedTag={onRemovedTag}
                            removeButtonClassName={removeButtonClassName}
                        />
                    </li>
                ))}
                {setTagMutation.isLoading && (
                    <li>
                        <Skeleton className="relative z-[8] h-6 w-[4rem] brightness-125" />
                    </li>
                )}
            </ul>
        </div>
    );
}

export type TagDropdownMenuProps = React.PropsWithChildren<
    {
        isTagDisabled?: (tag: Tag) => boolean;
    } & (
        | {
              onClick: (tag: TagGroup | Tag | undefined) => void;
              showAllOptions: true;
          }
        | {
              onClick: (tag: Tag) => void;
              showAllOptions?: false;
          }
    )
>;

export function TagDropdownMenu({ onClick, isTagDisabled, children, showAllOptions }: TagDropdownMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuGroup>
                    {showAllOptions && <DropdownMenuItem onClick={() => onClick(undefined)}>All</DropdownMenuItem>}
                    {tagGroups.map((group) => (
                        <DropdownMenuSub key={group.code}>
                            <DropdownMenuSubTrigger>
                                <span>{group.name}</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    {showAllOptions && (
                                        <DropdownMenuItem onClick={() => onClick(group)}>
                                            All {group.name}s
                                        </DropdownMenuItem>
                                    )}
                                    {group.tags.map((tag) => (
                                        <DropdownMenuItem
                                            key={tag.code}
                                            onClick={() => onClick(tag)}
                                            disabled={isTagDisabled?.(tag) ?? false}
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
                            onClick={() => onClick(tag)}
                            disabled={isTagDisabled?.(tag) ?? false}
                        >
                            <Badge className={tag.color.className}>{tag.name}</Badge>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
