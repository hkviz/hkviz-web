// similar taken from https://stackoverflow.com/questions/47285198/fetch-api-download-progress-indicator
export function wrapResultWithProgress(
    response: Response,
    onProgress: (update: { loaded: number; total: number | null }) => void,
) {
    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : null;
    let loaded = 0;

    return new Response(
        new ReadableStream({
            async start(controller) {
                const reader = response.body!.getReader();
                for (;;) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    loaded += value.byteLength;
                    onProgress({ loaded, total });
                    controller.enqueue(value);
                }
                controller.close();
            },
        }),
    );
}
