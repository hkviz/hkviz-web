'use client';

import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { tagFromCode, tagGroups, ungroupedTags, type Tag, type TagCode, type TagGroup } from '~/lib/types/tags';

export function RunTag({ tag }: { tag: Tag }) {
    return (
        <Badge className={cn('relative z-[8] overflow-hidden', tag.color.className)}>
            <span className="font-bold">{tag.name}</span>
        </Badge>
    );
}

export function RunTags({ codes: initialCodes, className }: { codes: TagCode[]; className?: string }) {
    const runTags = useMemo(() => initialCodes.map(tagFromCode).sort((a, b) => a.order - b.order), [initialCodes]);

    return (
        <div className={cn('items-[start] flex min-h-6 flex-row flex-wrap gap-1 font-sans', className)}>
            <ul className="flex flex-row flex-wrap-reverse items-end justify-end gap-1">
                {runTags.map((tag) => (
                    <li key={tag.code} className="flex w-fit flex-row">
                        <RunTag tag={tag} />
                    </li>
                ))}
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
