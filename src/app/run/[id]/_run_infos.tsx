import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { RelativeDate } from '../../_components/date';
import { type Session } from 'next-auth';
import { AppRouterOutput } from '~/server/api/types';

interface Props {
    session: Session | null;
    runData: AppRouterOutput['run']['getMetadataById'];
}

export function RunInfos({ session, runData }: Props) {
    const isFromUser = session?.user?.id === runData.user.id;
    return (
        <Table className="w-full">
            <TableBody>
                <TableRow>
                    <TableHead>From</TableHead>
                    <TableCell>{runData.user.name ?? 'Unnamed player'}</TableCell>
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
                    <TableHead>Visibility</TableHead>
                    <TableCell>Public</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    );
}
