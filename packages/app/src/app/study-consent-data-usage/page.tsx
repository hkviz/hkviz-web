import { getNavigationFlowFromCookies } from '~/lib/navigation-flow/from-cookies';
import { getServerAuthSession } from '~/server/auth';
import { apiFromServer } from '~/trpc/from-server';
import { AuthNeeded } from '../_components/auth-needed';
import { MdxInnerWrapper, MdxOuterWrapper } from '../../../../app2/src/components/mdx-layout';
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
    const navigationFlow = getNavigationFlowFromCookies();
    return (
        <DataCollectionStudyParticipationClientForm
            savedStudyParticipation={studyParticipation}
            formPositionText={formPositionText}
            className={className}
            navigationFlow={navigationFlow}
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
                className="mb-[min(3rem, 10vh)] mx-auto mt-[min(5rem,15vh)]"
            />
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
