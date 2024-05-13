'use client';

import { type Session } from 'next-auth';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { RunCard } from '~/app/_components/run-card';
import { useStoreInitializer } from '~/lib/stores/store-initializer';
import { type GetRunResult } from '~/server/api/routers/run/run-get';
import { GameplayDashboardWrapper } from './_dynamic_loader';

interface Props {
    session: Session | null;
    runData: GetRunResult;
}

export function SingleRunClientPage({ session, runData }: Props) {
    useStoreInitializer();
    const isOwnRun = session?.user?.id === runData.user.id;

    const [dashboardWrapper, setDashboardWrapper] = useState<HTMLDivElement | null>(null);
    const [cardWrapper, setCardWrapper] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        setDashboardWrapper(document.getElementById('dashboardWrapper') as HTMLDivElement);
    }, []);

    return (
        <>
            {dashboardWrapper &&
                createPortal(
                    <GameplayDashboardWrapper
                        startDate={runData.startedAt}
                        fileInfos={runData.files}
                        onRunCardWrapperReady={setCardWrapper}
                    />,
                    dashboardWrapper,
                )}
            {cardWrapper && createPortal(<RunCard run={runData} isOwnRun={isOwnRun} />, cardWrapper)}
        </>
    );
}
