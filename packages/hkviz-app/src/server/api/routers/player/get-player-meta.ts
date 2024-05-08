import { type Metadata } from 'next';
import { findPlayerPublicRuns } from './find-player-runs';

export async function getPlayerMeta(id: string): Promise<Metadata> {
    const runs = await findPlayerPublicRuns(id);

    if (runs.length === 0) {
        return {
            title: 'Player not found - HKViz',
        };
    }
    const name = runs[0]!.user.name ?? 'Unnamed player';
    return {
        title: `${name} - HKViz`,
        alternates: {
            canonical: `/player/${id}`,
        },
    };
}
