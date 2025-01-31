const CACHE_NAME = 'run-file-cache';

export async function openRunfileCache(): Promise<Cache | null> {
    if (!window.caches) return null;
    console.log('Opening cache');
    return window.caches.open(CACHE_NAME);
}

export async function fetchWithRunfileCache(
    cache: Promise<Cache | null>,
    fileId: string,
    version: number,
    signedUrl: string,
) {
    const request = new Request(`https://run-file-cache.internal/${fileId}/${version}`);

    function fetchFromServer(cache: Cache | null) {
        return fetch(signedUrl).then((response) => {
            // console.log(`Saving ${request.url} in cache`);
            void cache?.put(request, response.clone());
            return response;
        });
    }

    const cache_ = await cache;
    if (!cache_) return fetchFromServer(null);

    return cache_.match(request).then((response) => {
        if (response) {
            // console.log(`${request.url} found in local cache`);
            return response;
        }
        // console.log(`No response for ${request.url} found in cache`);

        return fetchFromServer(cache_);
    });
}
