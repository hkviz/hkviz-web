import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import type { Recording } from './recording';
import { parseRecordingFile } from './recording-file-parser';
import { fetchWithRunfileCache } from './recording-file-browser-cache';

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

export type RunFile =
    | {
          fileId: string;
          finishedLoading: false;
          fileVersion: number;
          loadingProgress: number | null;
      }
    | {
          fileId: string;
          finishedLoading: true;
          fileVersion: number;
          loadingProgress: 1;
          recording: Recording;
      };

export type RunId = string;
export type RunFileId = string;
export type RunFileStoreValue = Record<RunId, Record<RunFileId, RunFile>>;

export const useRunFileStore = create(
    combine({ runs: {} as RunFileStoreValue }, (set, get) => {
        function setLoaded(action: { fileVersion: number; runId: string; fileId: string; recording: Recording }) {
            set((state) => ({
                runs: {
                    ...state.runs,
                    [action.runId]: {
                        ...(state.runs[action.runId] ?? {}),
                        [action.fileId]: {
                            fileId: action.fileId,
                            finishedLoading: true,
                            loadingProgress: 1,
                            recording: action.recording,
                            fileVersion: action.fileVersion,
                        },
                    },
                },
            }));
        }
        function setLoadingProgress(action: {
            fileVersion: number;
            runId: string;
            fileId: string;
            progress: number | null;
        }) {
            set((state) => ({
                runs: {
                    ...state.runs,
                    [action.runId]: {
                        ...(state.runs[action.runId] ?? {}),
                        [action.fileId]: {
                            fileId: action.fileId,
                            finishedLoading: false,
                            loadingProgress: action.progress,
                            fileVersion: action.fileVersion,
                        },
                    },
                },
            }));
        }
        async function ensureLoaded({
            runId,
            fileId,
            version: fileVersion,
            downloadUrl,
        }: {
            runId: string;
            fileId: string;
            version: number;
            downloadUrl: string;
        }) {
            const isNewerThenCurrent = (get().runs[runId]?.[fileId]?.fileVersion ?? -1) < fileVersion;
            if (!isNewerThenCurrent) return;
            console.log('true', fileVersion, useRunFileStore.getState().runs[fileId]?.fileVersion ?? -1);
            setLoadingProgress({ fileVersion, runId, fileId, progress: 0 });

            const response = await fetchWithRunfileCache(fileId, downloadUrl).then((it) =>
                wrapResultWithProgress(it, ({ loaded, total }) => {
                    // console.log('progress', { loaded, total });
                    setLoadingProgress({ fileVersion, runId, fileId, progress: total ? loaded / total : null });
                }),
            );
            const data = await response.text();
            const isStillCurrent = (get().runs[runId]?.[fileId]?.fileVersion ?? -1) === fileVersion;
            if (!isStillCurrent) return;
            setLoaded({ fileVersion, runId, fileId, recording: parseRecordingFile(data) });
        }

        return { ensureLoaded };
    }),
);
