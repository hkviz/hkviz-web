import dynamic from 'next/dynamic';

export const RunSplitsSolidWrapper = dynamic(() => import('./_dynamic').then((it) => it.RunSplitsSolidWrapper), {
    ssr: false,
});

export const DashboardMapOptionsWrapper = dynamic(
    () => import('./_dynamic').then((it) => it.DashboardMapOptionsWrapper),
    {
        ssr: false,
    },
);

export const HkMapRoomsWrapper = dynamic(() => import('./_dynamic').then((it) => it.HkMapRoomsWrapper), {
    ssr: false,
});

export const AnimationOptionsWrapper = dynamic(() => import('./_dynamic').then((it) => it.AnimationOptionsWrapper), {
    ssr: false,
});

export const RunExtraChartsWrapper = dynamic(() => import('./_dynamic').then((it) => it.RunExtraChartsWrapper), {
    ssr: false,
});
