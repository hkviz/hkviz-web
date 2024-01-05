'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { tagFromCode, type Tag } from '~/lib/types/tags';
import { TagDropdownMenu } from '../_components/run-tags';
import { type RunFilterParams } from './_params';

export function RunFilters({ searchParams, className }: { searchParams: RunFilterParams; className?: string }) {
    const pathname = usePathname();
    const router = useRouter();
    const tag = useMemo(() => (searchParams.tag ? tagFromCode(searchParams.tag) : undefined), [searchParams.tag]);

    function setTagFilter(tag: Tag | undefined) {
        const current = new URLSearchParams(Array.from(Object.entries(searchParams))); // -> has to use this form

        const value = tag?.code;

        if (!value) {
            current.delete('tag');
        } else {
            current.set('tag', value);
        }

        const search = current.toString();
        const query = search ? `?${search}` : '';

        router.push(`${pathname}${query}`);
    }

    return (
        <Card className={cn('p-4', className)}>
            <TagDropdownMenu onClick={setTagFilter} showAllOption={true}>
                <Button variant="outline">
                    <span className="mr-2">Tag:</span>{' '}
                    {tag ? <Badge className={tag.color.className}>{tag.name}</Badge> : 'All'}
                </Button>
            </TagDropdownMenu>
        </Card>
    );
}
