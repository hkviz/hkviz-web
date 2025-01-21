import { type MetadataRoute } from 'next';
import { hkVizUrl } from '~/lib/url';

// eslint-disable-next-line @typescript-eslint/require-await
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    return [
        {
            url: hkVizUrl(),
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: hkVizUrl('/run'),
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: hkVizUrl('/guide/install'),
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: hkVizUrl('/guide/analytics'),
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: hkVizUrl('/credits'),
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: hkVizUrl('/privacy-policy'),
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.4,
        },
    ];
}
