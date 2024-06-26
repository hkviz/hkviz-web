import { tagFromCode, tagGroupFromCode } from '~/lib/types/tags';
import { type RunMetadata } from '~/server/run/_find_runs_internal';

export function getRunPageTitle(data: RunMetadata): string {
    const tagCodes = data.tags;

    const tags = tagCodes.map((code) => tagFromCode(code));
    const tagNames = tags.map((tag) => tag.name);

    const speedRunTags = tagGroupFromCode('speedrun').tags;
    const isSpeedrun = tags.some((tag) => speedRunTags.includes(tag));

    const titleTitle = data?.title ? data.title + ' - ' : '';
    const tagTitle = tagNames.length === 0 ? '' : tagNames.join(', ') + ' ';
    const typeTitle = isSpeedrun ? 'Speedrun' : 'Gameplay';
    const userTitle = data?.user?.name ? ` by ${data.user.name}` : '';
    return `${titleTitle}${tagTitle}${typeTitle}${userTitle} - HKViz`;
}
