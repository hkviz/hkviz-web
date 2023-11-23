import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const CACHE_NAME = 'run-file-cache';

export function fetchWithRunfileCache(fileId: string, version: number, signedUrl: string) {
    const request = new Request(`https://run-file-cache.internal/${fileId}/${version}`);

    function fetchFromServer(cache: Cache | null) {
        return fetch(signedUrl).then((response) => {
            console.log(`Saving ${request.url} in cache`);
            void cache?.put(request, response.clone());
            return response;
        });
    }

    if (!window.caches) return fetchFromServer(null);

    return window.caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((response) => {
            if (response) {
                console.log(`${request.url} found in local cache`);
                return response;
            }
            console.log(`No response for ${request.url} found in cache`);

            return fetchFromServer(cache);
        });
    });
}
