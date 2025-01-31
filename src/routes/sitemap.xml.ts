import { hkVizUrl } from '~/lib/url';
import { findPublicRuns } from '~/server/run/find-public-runs';
import { SitemapStream, streamToPromise } from 'sitemap';

async function writeSitemap(sitemapStream: SitemapStream) {
	sitemapStream.write({ url: hkVizUrl(), changefreq: 'weekly', priority: 1 });
	sitemapStream.write({ url: hkVizUrl('/run'), changefreq: 'daily', priority: 0.9 });
	sitemapStream.write({ url: hkVizUrl('/guide/install'), changefreq: 'monthly', priority: 0.9 });
	sitemapStream.write({ url: hkVizUrl('/guide/analytics'), changefreq: 'monthly', priority: 0.9 });
	sitemapStream.write({ url: hkVizUrl('/credits'), changefreq: 'monthly', priority: 0.6 });
	sitemapStream.write({ url: hkVizUrl('/privacy-policy'), changefreq: 'monthly', priority: 0.1 });

	const publicRuns = await findPublicRuns({
		sort: 'likes',
		limit: 250,
	});

	publicRuns.forEach((run) => {
		sitemapStream.write({ url: hkVizUrl(`/run/${run.id}`), changefreq: 'daily', priority: 0.3 });
	});

	new Set(publicRuns.map((run) => run.user.id)).forEach((id) => {
		sitemapStream.write({ url: hkVizUrl(`/player/${id}`), changefreq: 'daily', priority: 0.4 });
	});

	sitemapStream.end();
}

export async function GET(): Promise<Response> {
	const sitemapStream = new SitemapStream({ hostname: 'https://hkviz.org' });
	await writeSitemap(sitemapStream);
	const sitemap = await streamToPromise(sitemapStream);
	return new Response(sitemap, { headers: { 'Content-Type': 'application/xml' } });

	// return [...publicPlayerMap, ...publicRunsMap];

	// const publicRuns = await findPublicRuns({
	// 	sort: 'likes',
	// });

	// const publicRunsMap: MetadataRoute.Sitemap = publicRuns.map((run) => ({
	// 	url: hkVizUrl(`/run/${run.id}`),
	// 	lastModified: new Date(),
	// 	changeFrequency: 'daily',
	// 	// todo calc priority by popularity rating from started runs?
	// 	priority: 0.3,
	// }));

	// const publicPlayerMap: MetadataRoute.Sitemap = [...new Set(publicRuns.map((run) => run.user.id))].map((id) => ({
	// 	url: hkVizUrl(`/player/${id}`),
	// 	lastModified: new Date(),
	// 	changeFrequency: 'daily',
	// 	priority: 0.4,
	// }));
}
