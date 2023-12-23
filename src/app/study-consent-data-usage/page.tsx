import { apiFromServer } from '~/trpc/from-server';
import { DataCollectionStudyParticipationClientForm } from './_client_components';
import { cookies } from 'next/headers';
import { getServerAuthSession } from '~/server/auth';
import { AuthNeeded } from '../_components/auth-needed';
import { MdxInnerWrapper, MdxOuterWrapper } from '../_components/mdx-layout';
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
            <DataCollectionStudyParticipationForm formPositionText="bellow" className="mx-auto my-[10rem]" />
            <MdxInnerWrapper>
                <MdxContent />
            </MdxInnerWrapper>
            <DataCollectionStudyParticipationForm className="mx-auto mb-[20rem] mt-[10rem]" formPositionText="above" />
        </MdxOuterWrapper>
    );
}
