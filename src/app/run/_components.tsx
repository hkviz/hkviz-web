'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { runSortFromCode, runSorts, type RunSortCode } from '~/lib/types/run-sort';
import { isTag, tagOrGroupFromCode, type Tag, type TagGroup } from '~/lib/types/tags';
import { TagDropdownMenu } from '../_components/run-tags';
import { type RunFilterParams } from './_params';

export function RunFilters({ searchParams, className }: { searchParams: RunFilterParams; className?: string }) {
    const pathname = usePathname();
    const router = useRouter();
    const tagOrGroup = useMemo(
        () => (searchParams.tag ? tagOrGroupFromCode(searchParams.tag) : undefined),
        [searchParams.tag],
    );

    const sort = useMemo(() => runSortFromCode(searchParams.sort ?? 'favorites'), [searchParams.sort]);

    function setTagFilter(tagOrGroup: TagGroup | Tag | undefined) {
        const current = new URLSearchParams(Array.from(Object.entries(searchParams))); // -> has to use this form

        if (tagOrGroup === undefined) {
            // all
            current.delete('tag');
        } else if ('tags' in tagOrGroup) {
            // group
            current.set('tag', tagOrGroup.code);
        } else {
            // tag
            current.set('tag', tagOrGroup.code);
        }

        const search = current.toString();
        const query = search ? `?${search}` : '';

        router.push(`${pathname}${query}`);
    }

    function setSort(sort: RunSortCode) {
        const current = new URLSearchParams(Array.from(Object.entries(searchParams)));
        if (sort === 'favorites') {
            current.delete('sort');
        } else {
            current.set('sort', sort);
        }

        const search = current.toString();
        const query = search ? `?${search}` : '';

        router.push(`${pathname}${query}`);
    }

    return (
        <Card className={cn('flex flex-row gap-2 p-4', className)}>
            <TagDropdownMenu onClick={setTagFilter} showAllOptions={true}>
                <Button variant="outline">
                    <span className="mr-2 opacity-60">Tag:</span>{' '}
                    {tagOrGroup ? (
                        isTag(tagOrGroup) ? (
                            <Badge className={isTag(tagOrGroup) ? tagOrGroup.color.className : undefined}>
                                {tagOrGroup.name}
                            </Badge>
                        ) : (
                            `All ${tagOrGroup.name}s`
                        )
                    ) : (
                        'All'
                    )}
                </Button>
            </TagDropdownMenu>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                        <span className="mr-2 opacity-60">Sort:</span>
                        {sort.name}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {runSorts.map((sort) => (
                        <DropdownMenuItem key={sort.code} onSelect={() => setSort(sort.code)}>
                            {sort.name}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </Card>
    );
}
