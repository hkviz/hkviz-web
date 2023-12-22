import { apiFromServer } from '~/trpc/from-server';
import { DataCollectionStudyParticipationClientForm } from './_client_components';
import { cookies } from 'next/headers';

export async function DataCollectionStudyParticipationForm({
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
