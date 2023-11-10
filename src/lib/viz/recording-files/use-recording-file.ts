import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useRunFileStore } from './recording-file-store';
import { parseRecordingFile } from './recording-file-parser';

// similar taken from https://stackoverflow.com/questions/47285198/fetch-api-download-progress-indicator
function wrapResultWithProgress(
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

export function useRecordingFile({
    runId,
    fileVersion,
    downloadUrl,
}: {
    runId: string;
    downloadUrl: string;
    fileVersion: number;
}) {
    const setLoaded = useRunFileStore((it) => it.setLoaded);
    const setLoadingProgress = useRunFileStore((it) => it.setLoadingProgress);

    useEffect(() => {
        void (async function fetchStream() {
            const isNewestVersion = () => (useRunFileStore.getState().runs[runId]?.fileVersion ?? -1) < fileVersion;
            // if version is higher or no version in state
            if (!isNewestVersion()) return;
            console.log('true', fileVersion, useRunFileStore.getState().runs[runId]?.fileVersion ?? -1);
            setLoadingProgress({ fileVersion, runId, progress: 0 });

            const response = await fetch(downloadUrl).then((it) =>
                wrapResultWithProgress(it, ({ loaded, total }) => {
                    // console.log('progress', { loaded, total });
                    setLoadingProgress({ fileVersion, runId, progress: total ? loaded / total : null });
                }),
            );
            const data = await response.text();
            setLoaded({ fileVersion, runId, recording: parseRecordingFile(data) });
        })();
    }, [runId, fileVersion, downloadUrl, setLoadingProgress, setLoaded]);

    return useRunFileStore((state) => state.runs[runId]);
}
