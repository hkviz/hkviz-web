'use client';

import dynamic from 'next/dynamic';

export const AggregationVariableIconWrapper = dynamic(
    () => import('./_dynamic').then((it) => it.AggregationVariableIconWrapper),
    {
        ssr: false,
    },
);

export const GameplayDashboardWrapper = dynamic(() => import('./_dynamic').then((it) => it.GameplayDashboardWrapper), {
    ssr: false,
});

export const CompletionChartDocIconWrapper = dynamic(
    () => import('./_dynamic').then((it) => it.CompletionChartDocIconWrapper),
    {
        ssr: false,
    },
);

export function CompletionChartDocIcon() {
    return <CompletionChartDocIconWrapper />;
}

export const CompletionChartDocVarsWrapper = dynamic(
    () => import('./_dynamic').then((it) => it.CompletionChartDocVarsWrapper),
    {
        ssr: false,
    },
);

export function CompletionChartDocVars() {
    return <CompletionChartDocVarsWrapper />;
}

export const GeoChartDocIconWrapper = dynamic(() => import('./_dynamic').then((it) => it.GeoChartDocIconWrapper), {
    ssr: false,
});

export function GeoChartDocIcon() {
    return <GeoChartDocIconWrapper />;
}

export const GeoChartDocVarsWrapper = dynamic(() => import('./_dynamic').then((it) => it.GeoChartDocVarsWrapper), {
    ssr: false,
});

export function GeoChartDocVars() {
    return <GeoChartDocVarsWrapper />;
}

export const GrubsChartDocIconWrapper = dynamic(() => import('./_dynamic').then((it) => it.GrubsChartDocIconWrapper), {
    ssr: false,
});

export function GrubsChartDocIcon() {
    return <GrubsChartDocIconWrapper />;
}

export const GrubsChartDocVarsWrapper = dynamic(() => import('./_dynamic').then((it) => it.GrubsChartDocVarsWrapper), {
    ssr: false,
});

export function GrubsChartDocVars() {
    return <GrubsChartDocVarsWrapper />;
}

export const HealthChartDocIconWrapper = dynamic(
    () => import('./_dynamic').then((it) => it.HealthChartDocIconWrapper),
    {
        ssr: false,
    },
);

export function HealthChartDocIcon() {
    return <HealthChartDocIconWrapper />;
}

export const HealthChartDocVarsWrapper = dynamic(
    () => import('./_dynamic').then((it) => it.HealthChartDocVarsWrapper),
    {
        ssr: false,
    },
);

export function HealthChartDocVars() {
    return <HealthChartDocVarsWrapper />;
}

export const SoulChartDocIconWrapper = dynamic(() => import('./_dynamic').then((it) => it.SoulChartDocIconWrapper), {
    ssr: false,
});

export function SoulChartDocIcon() {
    return <SoulChartDocIconWrapper />;
}

export const SoulChartDocVarsWrapper = dynamic(() => import('./_dynamic').then((it) => it.SoulChartDocVarsWrapper), {
    ssr: false,
});

export function SoulChartDocVars() {
    return <SoulChartDocVarsWrapper />;
}

export const EssenceChartDocIconWrapper = dynamic(
    () => import('./_dynamic').then((it) => it.EssenceChartDocIconWrapper),
    {
        ssr: false,
    },
);

export function EssenceChartDocIcon() {
    return <EssenceChartDocIconWrapper />;
}

export const EssenceChartDocVarsWrapper = dynamic(
    () => import('./_dynamic').then((it) => it.EssenceChartDocVarsWrapper),
    {
        ssr: false,
    },
);

export function EssenceChartDocVars() {
    return <EssenceChartDocVarsWrapper />;
}
