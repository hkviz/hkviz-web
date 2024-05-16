import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { AuthNeeded } from '~/app/_components/auth-needed';
import { ContentCenterWrapper } from '~/app/_components/content-wrapper';
import { assertIsResearcher } from '~/server/api/routers/lib/researcher';
import { getParticipantsForAdmin } from '~/server/api/routers/study/participant';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';

function Data({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <TableRow>
            <TableCell>
                <div className="font-bold">{title}</div>
            </TableCell>
            <TableCell>{children}</TableCell>
        </TableRow>
    );
}

export default async function UserStudyAdmin() {
    const session = await getServerAuthSession();

    const userId = session?.user?.id;
    if (!userId) return <AuthNeeded />;

    await assertIsResearcher({
        db,
        userId,
        makeError: () => new Error('403 Forbidden'),
    });

    const data = await getParticipantsForAdmin();

    return (
        <ContentCenterWrapper>
            <div className="flex flex-col gap-4">
                {data.map((p) => (
                    <Card className="max-w-[60ch]" key={p.participantId}>
                        <CardHeader>
                            <CardTitle>
                                {p.callName} - {p.callOption}
                            </CardTitle>
                            <CardDescription>{p.timeslot.startAt}</CardDescription>
                        </CardHeader>
                        <Table>
                            <TableBody>
                                <Data title="Participant ID">{p.participantId}</Data>
                                <Data title="Locale">{p.locale}</Data>
                                <Data title="Timezone">{p.timeZone}</Data>
                                <Data title="User ID">{p.user?.id}</Data>
                                <Data title="Email">{p.user?.email}</Data>
                                <Data title="Name">{p.user?.name}</Data>
                                <Data title="Country">{p.demographics?.country}</Data>
                                <Data title="Hk experience">{p.hkExperience?.id}</Data>
                                <Data title="Playing since">{p.hkExperience?.playingSince}</Data>
                                <Data title="Playing frequency">{p.hkExperience?.playingFrequency}</Data>
                            </TableBody>
                        </Table>
                    </Card>
                ))}
            </div>
        </ContentCenterWrapper>
    );
}
