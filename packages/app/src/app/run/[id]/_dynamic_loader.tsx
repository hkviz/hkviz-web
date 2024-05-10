import dynamic from 'next/dynamic';

export const RunSplitsSolidWrapper = dynamic(() => import('./_dynamic').then((it) => it.RunSplitsSolidWrapper), {
    ssr: false,
});

export const RoomInfoWrapper = dynamic(() => import('./_dynamic').then((it) => it.RoomInfoWrapper), {
    ssr: false,
});

export const HkMapRoomsWrapper = dynamic(() => import('./_dynamic').then((it) => it.HkMapRoomsWrapper), {
    ssr: false,
});

export const AnimationOptionsWrapper = dynamic(() => import('./_dynamic').then((it) => it.AnimationOptionsWrapper), {
    ssr: false,
});
