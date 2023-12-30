import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { RelativeDate } from '../../_components/date';
import { type Session } from 'next-auth';
import { type AppRouterOutput } from '~/server/api/types';
import { type RunVisibility } from '~/lib/viz/types/run-visibility';
import { assertNever } from '~/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { api } from '~/trpc/react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Props {
    session: Session | null;
    runData: AppRouterOutput['run']['getMetadataById'];
}

export function runVisibilityToDisplayName(visibility: RunVisibility) {
    switch (visibility) {
        case 'public':
            return 'Public';
        case 'unlisted':
            return 'Unlisted';
        case 'private':
            return 'Private';
        default:
            assertNever(visibility);
    }
}

export function RunInfos({ session, runData }: Props) {
    const isFromUser = session?.user?.id === runData.user.id;
    const [visibility, setVisibility] = useState<RunVisibility>(runData.visibility);

    const { toast } = useToast();
    const visibilityMutation = api.run.setRunVisibility.useMutation();

    async function handleVisibilityChange(newVisibility: RunVisibility) {
        setVisibility(newVisibility);
        await visibilityMutation.mutateAsync({ id: runData.id, visibility: newVisibility });

        toast({
            title: 'Successfully set run visibility to ' + runVisibilityToDisplayName(newVisibility),
        });
    }

    return (
        <Table className="w-full">
            <TableBody>
                <TableRow>
                    <TableHead>From</TableHead>
                    <TableCell>
                        <Button asChild variant="link" className="-m-4 p-4">
                            <Link href={`/player/${runData.user.id}`}>{runData.user.name ?? 'Unnamed player'}</Link>
                        </Button>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableHead>Started</TableHead>
                    <TableCell>{runData.startedAt && <RelativeDate date={runData.startedAt} />}</TableCell>
                </TableRow>
                <TableRow>
                    <TableHead>Last played</TableHead>
                    <TableCell>{runData.lastPlayedAt && <RelativeDate date={runData.lastPlayedAt} />}</TableCell>
                </TableRow>
                <TableRow>
                    <TableHead>
                        <Label className="flex items-center" htmlFor="visibleRunSelectTrigger">
                            Visibility
                        </Label>
                    </TableHead>
                    <TableCell>
                        {!isFromUser ? (
                            <>{runVisibilityToDisplayName(runData.visibility)}</>
                        ) : (
                            <Select value={visibility} onValueChange={handleVisibilityChange}>
                                <SelectTrigger id="visibleRunSelectTrigger">
                                    <SelectValue placeholder="visibility" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">Public</SelectItem>
                                    <SelectItem value="unlisted">Unlisted</SelectItem>
                                    <SelectItem value="private">Private</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    );
}
