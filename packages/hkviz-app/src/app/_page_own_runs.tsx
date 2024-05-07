'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { useCallback, useId, useState } from 'react';
import type { findRuns } from '~/server/api/routers/run/runs-find';
import { api } from '~/trpc/react';
import { BottomInteractionRow, BottomInteractionRowText } from './_components/bottom_interaction';
import { RunCard } from './_components/run-card';

interface OwnRunsPageProps {
    runs: Awaited<ReturnType<typeof findRuns>>;
}

export function OwnRuns({ runs }: OwnRunsPageProps) {
    const { toast } = useToast();
    const router = useRouter();

    const combineRunMutation = api.run.combine.useMutation({
        onSuccess: () => {
            toast({
                title: 'Gameplays successfully combined',
            });
            setSelectedRunIds([]);
            router.refresh();
        },
        onError: (error) => {
            console.log('failed to combine gameplays', error);
            toast({
                title: 'Failed to combine gameplays',
                description: error.message,
            });
        },
    });

    const id = useId();
    const [selectedRunIds, setSelectedRunIds] = useState<string[]>([]);

    function handleCheckedChanged(runId: string, checked: boolean) {
        if (checked) {
            setSelectedRunIds([...selectedRunIds, runId]);
        } else {
            setSelectedRunIds(selectedRunIds.filter((id) => id !== runId));
        }
    }

    function cancelCombine() {
        setSelectedRunIds([]);
    }

    function combine() {
        combineRunMutation.mutate({
            runIds: selectedRunIds,
        });
    }

    const onCombineClicked = useCallback((runId: string) => {
        setSelectedRunIds((selectedRunIds) => [...selectedRunIds, runId]);
    }, []);

    const inCombineMode = selectedRunIds.length >= 1;

    const onRunClick = useCallback((runId: string) => {
        setSelectedRunIds((selectedRunIds) => {
            if (selectedRunIds.includes(runId)) {
                return selectedRunIds.filter((id) => id !== runId);
            } else {
                return [...selectedRunIds, runId];
            }
        });
    }, []);

    const onRunClickIfInCombineMode = inCombineMode ? onRunClick : undefined;

    return (
        <div className="w-full">
            <div className="mx-auto max-w-[800px]">
                <h1 className="mb-4 pl-2 text-center font-serif text-3xl font-semibold">Your gameplays</h1>
                <ul className="flex flex-col">
                    {runs.map((run) => {
                        const checkboxId = `run-checkbox-${id}-${run.id}`;
                        return (
                            <li key={run.id} className="flex flex-row items-center gap-3">
                                {inCombineMode && (
                                    <Checkbox
                                        id={checkboxId}
                                        checked={selectedRunIds.includes(run.id)}
                                        onCheckedChange={(checked) => handleCheckedChanged(run.id, checked as boolean)}
                                    />
                                )}
                                <div className="flex-grow">
                                    <RunCard
                                        run={run}
                                        key={run.id}
                                        showUser={false}
                                        isOwnRun={true}
                                        className="grow"
                                        onClick={onRunClickIfInCombineMode}
                                        onCombineClicked={onCombineClicked}
                                    />
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
            <BottomInteractionRow isVisible={inCombineMode} mode="fixed">
                <BottomInteractionRowText>
                    {selectedRunIds.length > 1
                        ? `${selectedRunIds.length} gameplays selected`
                        : 'Select gameplays to combine into one'}
                </BottomInteractionRowText>
                <Button onClick={cancelCombine} variant="ghost" disabled={combineRunMutation.isLoading}>
                    Cancel
                </Button>
                <Button
                    onClick={combine}
                    variant="default"
                    disabled={selectedRunIds.length < 2 || combineRunMutation.isLoading}
                >
                    Combine
                </Button>
            </BottomInteractionRow>
        </div>
    );
}
