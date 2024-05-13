import dynamic from 'next/dynamic';

export const DashboardMapOptionsWrapper = dynamic(
    () => import('./_dynamic').then((it) => it.DashboardMapOptionsWrapper),
    {
        ssr: false,
    },
);

export const HkMapWrapper = dynamic(() => import('./_dynamic').then((it) => it.HkMapWrapper), {
    ssr: false,
});

export const AnimationOptionsWrapper = dynamic(() => import('./_dynamic').then((it) => it.AnimationOptionsWrapper), {
    ssr: false,
});

export const RightCardWrapper = dynamic(() => import('./_dynamic').then((it) => it.RightCardWrapper), {
    ssr: false,
});
