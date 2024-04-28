import { apiFromServer } from '~/trpc/from-server';

export async function GET(request: Request, { params: { resetId } }: { params: { resetId: string } }) {
    const api = await apiFromServer();

    await api.participant.resetParticipant({ resetId });

    return new Response('Link reset successful', { status: 200 });
}
