import { cookies } from 'next/headers';
import { getServerAuthSession } from '~/server/auth';
import { apiFromServer } from '~/trpc/from-server';
import { AuthNeeded } from '../_components/auth-needed';
import { MdxInnerWrapper, MdxOuterWrapper } from '../_components/mdx-layout';
import { DataCollectionStudyParticipationClientForm } from './_client_components';
import MdxContent from './_page.mdx';

async function DataCollectionStudyParticipationForm({
    className,
    formPositionText,
}: {
    className?: string;
    formPositionText: string;
}) {
    const studyParticipation = await (await apiFromServer()).studyParticipation.getStudyParticipation({});
    const hasIngameAuthCookie = cookies().get('ingameAuthUrlId') != null;
    return (
        <DataCollectionStudyParticipationClientForm
            savedStudyParticipation={studyParticipation}
            formPositionText={formPositionText}
            className={className}
            hasIngameAuthCookie={hasIngameAuthCookie}
        />
    );
}

export default async function DataCollectionStudyParticipationPage() {
    const session = await getServerAuthSession();

    if (!session) {
        return <AuthNeeded />;
    }

    return (
        <MdxOuterWrapper>
            <DataCollectionStudyParticipationForm
                formPositionText="below"
                className="my-[min(10rem,15vh)] mx-auto"
            />
            <MdxInnerWrapper>
                <MdxContent />
            </MdxInnerWrapper>
            <DataCollectionStudyParticipationForm
                className="mt-[min(10rem,15vh)] mx-auto mb-[20rem]"
                formPositionText="above"
            />
        </MdxOuterWrapper>
    );
}
