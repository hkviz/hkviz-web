'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { type TagGroup, isTag, tagOrGroupFromCode, type Tag } from '~/lib/types/tags';
import { TagDropdownMenu } from '../_components/run-tags';
import { type RunFilterParams } from './_params';

export function RunFilters({ searchParams, className }: { searchParams: RunFilterParams; className?: string }) {
    const pathname = usePathname();
    const router = useRouter();
    const tagOrGroup = useMemo(() => (searchParams.tag ? tagOrGroupFromCode(searchParams.tag) : undefined), [searchParams.tag]);

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

    return (
        <Card className={cn('p-4', className)}>
            <TagDropdownMenu onClick={setTagFilter} showAllOptions={true}>
                <Button variant="outline">
                    <span className="mr-2">Tag:</span>{' '}
                    {tagOrGroup ? isTag(tagOrGroup) ? <Badge className={isTag(tagOrGroup) ?  tagOrGroup.color.className : undefined}>{tagOrGroup.name}</Badge> : `All ${tagOrGroup.name}s` : 'All'}
                </Button>
            </TagDropdownMenu>
        </Card>
    );
}
