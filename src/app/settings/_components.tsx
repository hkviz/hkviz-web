'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { type AppRouterOutput } from '~/server/api/types';
import { api } from '~/trpc/react';

export function KeepAccountSettingsOption({
    studyParticipation,
}: {
    studyParticipation: AppRouterOutput['studyParticipation']['getStudyParticipation'];
}) {
    const { toast } = useToast();

    const studyParticipationQuery = api.studyParticipation.getStudyParticipation.useQuery({});

    const participation = studyParticipationQuery.data ?? studyParticipation;

    const saveMutation = api.studyParticipation.saveStudyParticipation.useMutation();

    const handleKeepClick = async () => {
        saveMutation.reset();
        const participationQueryResult = await studyParticipationQuery.refetch();
        await saveMutation.mutateAsync({
            futureContactOk: participationQueryResult.data!.futureContactOk,
            keepDataAfterStudyConducted: true,
        });
        await studyParticipationQuery.refetch();
        toast({
            title: 'Successfully set account to be kept after study',
        });
    };

    if (!participation || participation.keepDataAfterStudyConducted) {
        return undefined;
    }

    return (
        <div className="-m-4 mb-4 flex flex-col justify-between gap-4 rounded-md bg-red-300 p-4 dark:bg-red-500 dark:bg-opacity-30 sm:flex-row sm:items-center">
            <div>
                <h3 className="text-lg font-semibold">Your account is set to be deleted once our study is conducted</h3>
            </div>
            <Button
                className="shrink-0"
                variant="destructive"
                onClick={handleKeepClick}
                disabled={saveMutation.isLoading}
            >
                Keep account
            </Button>
        </div>
    );
}
