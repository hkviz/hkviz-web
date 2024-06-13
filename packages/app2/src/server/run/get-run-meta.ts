import { TRPCError } from '@trpc/server';
import { type Metadata } from 'next';
import { tagFromCode, tagGroupFromCode } from '~/lib/types/tags';
import { getRun } from './run-get';

export async function getRunMeta(id: string, sessionUserId: string | null): Promise<Metadata> {
    try {
        const data = await getRun(id, sessionUserId);

        const tagCodes = data.tags;

        const tags = tagCodes.map((code) => tagFromCode(code));
        const tagNames = tags.map((tag) => tag.name);

        const speedRunTags = tagGroupFromCode('speedrun').tags;
        const isSpeedrun = tags.some((tag) => speedRunTags.includes(tag));

        const titleTitle = data?.title ? data.title + ' - ' : '';
        const tagTitle = tagNames.length === 0 ? '' : tagNames.join(', ') + ' ';
        const typeTitle = isSpeedrun ? 'Speedrun' : 'Gameplay';
        const userTitle = data?.user?.name ? ` by ${data.user.name}` : '';
        return {
            title: `${titleTitle}${tagTitle}${typeTitle}${userTitle} - HKViz`,
            alternates: {
                canonical: `/run/${id}`,
            },
        };
    } catch (e) {
        if (e instanceof TRPCError && e.code === 'NOT_FOUND') {
            return {
                title: 'Run not found - HKViz',
            };
        }
        if (e instanceof TRPCError && e.code === 'FORBIDDEN') {
            return {
                title: 'Run is private - HKViz',
            };
        }
        throw e;
    }
}
