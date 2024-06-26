import { TRPCError } from '@trpc/server';
import { type Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { SingleRunClientPage } from '~/app/run/[id]/_page';
import { getRunMeta } from '~/server/api/routers/run/get-run-meta';
import { getRun } from '~/server/api/routers/run/run-get';
import { findNewRunId } from '~/server/api/routers/run/runs-find';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';
import { ContentCenterWrapper, ContentWrapper } from '../../../../../app2/src/components/content-wrapper';

interface Params {
    id: string;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const session = await getServerAuthSession();
    return getRunMeta(params.id, session?.user?.id ?? null);
}

export default async function SingleRunPage({ params }: { params: Params }) {
    const session = await getServerAuthSession();

    try {
        const runData = await getRun(params.id, session?.user?.id ?? null);

        return (
            <ContentWrapper footerOutOfSight={true}>
                <SingleRunClientPage runData={runData} session={session} />
            </ContentWrapper>
        );
    } catch (e) {
        if (e instanceof TRPCError && e.code === 'NOT_FOUND') {
            const newId = await findNewRunId(db, params.id);
            if (newId) {
                redirect(`/run/${newId}`);
            }

            notFound();
        }
        if (e instanceof TRPCError && e.code === 'FORBIDDEN') {
            return (
                <ContentCenterWrapper>
                    This gameplay is set to private and can only be viewed by its owner.
                </ContentCenterWrapper>
            );
        }
        throw e;
    }
}
