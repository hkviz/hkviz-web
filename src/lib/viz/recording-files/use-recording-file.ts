import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export function useRecordingFileQuery({ runId, downloadUrl }: { runId: string; downloadUrl: string }) {
    const progress = useState(0);
    const query = useQuery({
        queryKey: ['runFile', runId],
        queryFunction: async () => {
            const fetchResult = await fetch(downloadUrl);
            const text = fetchResult.body();
        },
    });
}
