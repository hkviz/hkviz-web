import { type Metadata } from 'next';
import { tagFromCode, tagGroupFromCode, type TagCode } from '~/lib/types/tags';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';
import { runTagFieldsSelect } from './run-column-selects';

export async function getRunMeta(id: string): Promise<Metadata> {
    const data = await db.query.runs.findFirst({
        where: (run, { eq, and }) => and(eq(run.id, id), eq(run.deleted, false)),
        columns: {
            visibility: true,
            archived: true,
            ...runTagFieldsSelect,
        },
        with: {
            user: {
                columns: {
                    id: true,
                    name: true,
                },
            },
        },
    });

    let isAllowedToView = true;
    if (data?.visibility === 'private' || data?.archived) {
        const session = await getServerAuthSession();
        const userId = session?.user?.id;
        if (!userId || userId !== data.user.id) {
            isAllowedToView = false;
        }
    }

    if (!data || !isAllowedToView) {
        return {
            title: 'Run not found - HKViz',
        };
    }

    const tagCodes = Object.entries(data)
        .filter((kv) => kv[0].startsWith('tag_') && kv[1] === true)
        .map((kv) => kv[0].slice(4)) as TagCode[];

    const tags = tagCodes.map((code) => tagFromCode(code));
    const tagNames = tags.map((tag) => tag.name);

    const speedRunTags = tagGroupFromCode('speedrun').tags;
    const isSpeedrun = tags.some((tag) => speedRunTags.includes(tag));

    const tagTitle = tagNames.length === 0 ? '' : tagNames.join(', ') + ' ';
    const typeTitle = isSpeedrun ? 'Speedrun' : 'Gameplay';
    const userTitle = data?.user?.name ? ` by ${data.user.name}` : '';
    return {
        title: `${tagTitle}${typeTitle}${userTitle} - HKViz`,
        alternates: {
            canonical: `/run/${id}`,
        },
    };
}
