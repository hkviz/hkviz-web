import { type Session } from 'next-auth';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { RunCard } from '~/app/_components/run-card';
import { useStoreInitializer } from '~/lib/stores/store-initializer';
import { type GetRunResult } from '~/server/api/routers/run/run-get';
import { GameplayDashboardWrapper } from '../../../../app/src/app/run/[id]/_dynamic_loader';
import { createRunFileLoader, type RunFileLoader } from '@hkviz/viz';

interface Props {
    session: Session | null;
    runData: GetRunResult;
}

export function SingleRunClientPage({ session, runData }: Props) {
    useStoreInitializer();
    const isOwnRun = session?.user?.id === runData.user.id;

    const [runFileLoader, setRunFileLoader] = useState<RunFileLoader | null>(null);

    const createdLoader = useRef(false);

    useEffect(() => {
        if (!createdLoader.current) {
            const loader = createRunFileLoader(runData.files);
            setRunFileLoader(loader);
            createdLoader.current = true;

            // return () => loader.abort();
        }
    }, [runData.files]);

    const [cardWrapper, setCardWrapper] = useState<HTMLDivElement | null>(null);

    return (
        <>
            {runFileLoader && (
                <GameplayDashboardWrapper
                    startDate={runData.startedAt}
                    fileInfos={runData.files}
                    onRunCardWrapperReady={setCardWrapper}
                    runFileLoader={runFileLoader}
                />
            )}
            {cardWrapper && createPortal(<RunCard run={runData} isOwnRun={isOwnRun} />, cardWrapper)}
        </>
    );
}
