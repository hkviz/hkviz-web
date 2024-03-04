import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { type AppRouterOutput } from '~/server/api/types';
import { combineRecordings } from './combine-recordings';
import type { CombinedRecording, ParsedRecording } from './recording';
import { fetchWithRunfileCache } from './recording-file-browser-cache';
import { parseRecordingFile } from './recording-file-parser';
import { useRunAggregationStore } from './run-aggregation-store';

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

export type LoadedRunFile = {
    fileId: string;
    finishedLoading: true;
    combinedPartNumber: number;
    fileVersion: number;
    loadingProgress: 1;
    recording: ParsedRecording;
};

export type LoadingRunFile = {
    fileId: string;
    finishedLoading: false;
    combinedPartNumber: number;
    fileVersion: number;
    loadingProgress: number | null;
};

export type RunFile = LoadingRunFile | LoadedRunFile;

export type Run = {
    runId: string;
    nrOfFiles: number;
} & ({ finishedLoading: false } | { finishedLoading: true; recording: CombinedRecording });

export type RunId = string;
export type RunFileId = string;
// contains parsed runs for each file
export type FilesStoreValue = Record<RunId, Record<RunFileId, RunFile>>;
// contains combined run from all files of run
export type RunsStoreValue = Record<RunId, Run>;

export const useRunFileStore = create(
    combine({ files: {} as FilesStoreValue, runs: {} as RunsStoreValue }, (set, get) => {
        function setLoaded(action: {
            fileVersion: number;
            runId: string;
            fileId: string;
            recording: ParsedRecording;
            combinedPartNumber: number;
        }) {
            set((state) => ({
                files: {
                    ...state.files,
                    [action.runId]: {
                        ...(state.files[action.runId] ?? {}),
                        [action.fileId]: {
                            fileId: action.fileId,
                            finishedLoading: true,
                            loadingProgress: 1,
                            recording: action.recording,
                            fileVersion: action.fileVersion,
                            combinedPartNumber: action.combinedPartNumber,
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
            combinedPartNumber: number;
        }) {
            set((state) => ({
                files: {
                    ...state.files,
                    [action.runId]: {
                        ...(state.files[action.runId] ?? {}),
                        [action.fileId]: {
                            fileId: action.fileId,
                            finishedLoading: false,
                            loadingProgress: action.progress,
                            fileVersion: action.fileVersion,
                            combinedPartNumber: action.combinedPartNumber,
                        },
                    },
                },
            }));
        }
        async function ensureLoaded({
            runId,
            fileId,
            version: fileVersion,
            combinedPartNumber,
            downloadUrl,
        }: {
            runId: string;
            fileId: string;
            version: number;
            combinedPartNumber: number;
            downloadUrl: string;
        }) {
            const isNewerThenCurrent = (get().files[runId]?.[fileId]?.fileVersion ?? -1) < fileVersion;
            if (!isNewerThenCurrent) return;
            setLoadingProgress({ combinedPartNumber, fileVersion, runId, fileId, progress: 0 });
            setRunNotLoaded(runId);

            const loader = () => fetchWithRunfileCache(fileId, fileVersion, downloadUrl);

            // uncomment to get file content from console. useful for debugging
            // very bad for performance, since context needs to be kept in memory.

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            // (window as any)['fileLoader_' + combinedPartNumber] = loader;

            const response = await loader().then((it) =>
                wrapResultWithProgress(it, ({ loaded, total }) => {
                    setLoadingProgress({
                        combinedPartNumber,
                        fileVersion,
                        runId,
                        fileId,
                        progress: total ? loaded / total : null,
                    });
                }),
            );
            const data = await response.text();
            const isStillCurrent = (get().files[runId]?.[fileId]?.fileVersion ?? -1) === fileVersion;
            if (!isStillCurrent) return;
            const recording = parseRecordingFile(data, combinedPartNumber);
            setLoaded({ combinedPartNumber, fileVersion, runId, fileId, recording });
            combineIfAllFinished(runId);
        }

        function combineIfAllFinished(runId: string) {
            const files = get().files[runId];
            if (!files || get().runs[runId]?.finishedLoading) return;
            const finishedFiles = Object.values(files).filter((it): it is LoadedRunFile => it.finishedLoading);
            if (finishedFiles.length != get().runs[runId]?.nrOfFiles) return;
            const recordings = finishedFiles.map((it) => it.recording);
            const combinedRecording = combineRecordings(recordings);
            set((state) => ({
                runs: {
                    ...state.runs,
                    [runId]: {
                        runId,
                        nrOfFiles: recordings.length,
                        finishedLoading: true,
                        recording: combinedRecording,
                    },
                },
            }));
            useRunAggregationStore.getState().updateFromCombinedRecording(combinedRecording, runId);
        }

        function setRunNotLoaded(runId: string) {
            const existing = get().runs[runId];
            set((state) => ({
                runs: {
                    ...state.runs,
                    [runId]: {
                        runId,
                        nrOfFiles: existing?.nrOfFiles ?? 0,
                        finishedLoading: false,
                    },
                },
            }));
        }

        async function ensureWholeRunLoaded(
            runId: string,
            fileInfos: AppRouterOutput['run']['getMetadataById']['files'],
        ) {
            console.log(
                'file infos',
                fileInfos.map((it) => ({ id: it.id, version: it.version })),
            );
            const existing = get().runs[runId];
            if (!existing || existing.nrOfFiles !== fileInfos.length) {
                // if file version different, finished Loading will be set by loading individual files
                set({ runs: { [runId]: { runId, nrOfFiles: fileInfos.length, finishedLoading: false } } });
            }

            await Promise.all(
                fileInfos.map((fileInfo) => {
                    return ensureLoaded({
                        runId: runId,
                        fileId: fileInfo.id,
                        version: fileInfo.version,
                        downloadUrl: fileInfo.signedUrl,
                        combinedPartNumber: fileInfo.combinedPartNumber,
                    });
                }),
            );
        }

        return { ensureLoaded, ensureWholeRunLoaded };
    }),
);
