import { useEffect, useMemo } from 'react';
import { type AppRouterOutput } from '~/server/api/types';
import { useRunFileStore } from './recording-file-store';

export function useRecordingFiles(runId: string, fileInfos: AppRouterOutput['run']['getMetadataById']['files']) {
    const fileIds = useMemo(() => fileInfos.map((it) => it.id), [fileInfos]);
    const ensureWholeRunLoaded = useRunFileStore((it) => it.ensureWholeRunLoaded);

    useEffect(() => {
        void ensureWholeRunLoaded(runId, fileInfos);
    }, [ensureWholeRunLoaded, fileInfos, runId]);

    const filesRecord = useRunFileStore((state) => state.files[runId] ?? {});
    const combinedRun = useRunFileStore((state) => state.runs[runId]);

    return useMemo(() => {
        const files = Object.values(filesRecord).sort((a, b) => a.partNumber - b.partNumber);
        const allThere = files.length === fileIds.length;
        return {
            files: Object.values(filesRecord),
            loadingProgress: files.reduce((acc, it) => acc + (it.loadingProgress ?? 0), 0) / fileIds.length,
            finishedLoading: allThere && files.every((it) => it.finishedLoading),
            combinedRun,
        };
    }, [fileIds, filesRecord, combinedRun]);
}
