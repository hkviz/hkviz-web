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
            <DataCollectionStudyParticipationForm formPositionText="below" className="mx-auto mt-[min(5rem,15vh)] mb-[min(3rem, 10vh)]" />
            <MdxInnerWrapper>
                <MdxContent />
            </MdxInnerWrapper>
            <DataCollectionStudyParticipationForm
                className="mx-auto mb-[20rem] mt-[min(5rem,15vh)]"
                formPositionText="above"
            />
        </MdxOuterWrapper>
    );
}
