import { useEffect, useMemo } from 'react';
import { parseRecordingFile } from './recording-file-parser';
import { useRunFileStore } from './recording-file-store';
import { AppRouterOutput } from '~/server/api/types';

// export function useRecordingFile({
//     runId,
//     fileVersion,
//     downloadUrl,
// }: {
//     runId: string;
//     downloadUrl: string;
//     fileVersion: number;
// }) {
//     const setLoaded = useRunFileStore((it) => it.setLoaded);
//     const setLoadingProgress = useRunFileStore((it) => it.setLoadingProgress);

//     useEffect(() => {
//         void (async function fetchStream() {
//             const isNewestVersion = () => (useRunFileStore.getState().runFiles[runId]?.fileVersion ?? -1) < fileVersion;
//             // if version is higher or no version in state
//             if (!isNewestVersion()) return;
//             console.log('true', fileVersion, useRunFileStore.getState().runFiles[runId]?.fileVersion ?? -1);
//             setLoadingProgress({ fileVersion, runFileId: runId, progress: 0 });

//             const response = await fetch(downloadUrl).then((it) =>
//                 wrapResultWithProgress(it, ({ loaded, total }) => {
//                     // console.log('progress', { loaded, total });
//                     setLoadingProgress({ fileVersion, runFileId: runId, progress: total ? loaded / total : null });
//                 }),
//             );
//             const data = await response.text();
//             setLoaded({ fileVersion, runFileId: runId, recording: parseRecordingFile(data) });
//         })();
//     }, [runId, fileVersion, downloadUrl, setLoadingProgress, setLoaded]);

//     return useRunFileStore((state) => state.runFiles[runId]);
//}

export function useRecordingFiles(runId: string, fileInfos: AppRouterOutput['run']['getMetadataById']['files']) {
    const fileIds = useMemo(() => fileInfos.map((it) => it.id), [fileInfos]);
    const ensureLoaded = useRunFileStore((it) => it.ensureLoaded);

    useEffect(() => {
        fileInfos.forEach((fileInfo) => {
            void ensureLoaded({
                runId: runId,
                fileId: fileInfo.id,
                version: fileInfo.version,
                downloadUrl: fileInfo.signedUrl,
                partNumber: fileInfo.partNumber,
            });
        });
    }, [ensureLoaded, fileInfos, runId]);

    const filesRecord = useRunFileStore((state) => state.runs[runId] ?? {});

    return useMemo(() => {
        const files = Object.values(filesRecord).sort((a, b) => a.partNumber - b.partNumber);
        const allThere = files.length === fileIds.length;
        return {
            files: Object.values(filesRecord),
            loadingProgress: files.reduce((acc, it) => acc + (it.loadingProgress ?? 0), 0) / fileIds.length,
            finishedLoading: allThere && files.every((it) => it.finishedLoading),
        };
    }, [fileIds, filesRecord]);
}
