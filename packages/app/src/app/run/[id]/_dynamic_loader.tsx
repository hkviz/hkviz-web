import dynamic from 'next/dynamic';

export const GameplayDashboardWrapper = dynamic(() => import('./_dynamic').then((it) => it.GameplayDashboardWrapper), {
    ssr: false,
});
