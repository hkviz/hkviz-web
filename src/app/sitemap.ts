import { type MetadataRoute } from 'next';
import { findRuns } from '~/server/api/routers/run/runs-find';
import { db } from '~/server/db';

function url(path = ''): string {
    return `https://hkviz.olii.dev${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const publicRuns = await findRuns({
        db,
        filter: {
            visibility: ['public'],
            archived: [false],
        },
    });

    const publicRunsMap: MetadataRoute.Sitemap = publicRuns.map((run) => ({
        url: url(`/run/${run.id}`),
        lastModified: new Date(),
        changeFrequency: 'daily',
        // todo calc priority by popularity rating from started runs?
        priority: 0.3,
    }));

    const publicPlayerMap: MetadataRoute.Sitemap = [...new Set(publicRuns.map((run) => run.user.id))].map((id) => ({
        url: url(`/player/${id}`),
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.4,
    }));

    return [
        {
            url: url(),
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: url('/run'),
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: url('/getting-started'),
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: url('/credits'),
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.2,
        },
        {
            url: url('/privacy-policy'),
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.05,
        },
        ...publicPlayerMap,
        ...publicRunsMap,
    ];
}
