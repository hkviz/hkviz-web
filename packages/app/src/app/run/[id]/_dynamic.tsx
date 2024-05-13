'use client';
import { type AggregationVariable } from '@hkviz/viz';
import {
    AggregationVariableIcon,
    CompletionChartDocIcon,
    CompletionChartDocVars,
    EssenceChartDocIcon,
    EssenceChartDocVars,
    GameplayDashboard,
    GeoChartDocIcon,
    GeoChartDocVars,
    GrubsChartDocIcon,
    GrubsChartDocVars,
    HealthChartDocIcon,
    HealthChartDocVars,
    SoulChartDocIcon,
    SoulChartDocVars,
    render,
    type GameplayDashboardProps,
} from '@hkviz/viz-ui';
import { useEffect, useRef, useState } from 'react';
import { createStore } from 'solid-js/store';

function useReactPropsToSolid<T extends object>(props: T) {
    const [[get, set]] = useState(() => createStore(props));

    set(props);

    return get;
}

export function AggregationVariableIconWrapper({ variable }: { variable: AggregationVariable }) {
    const wrapper = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (wrapper.current) {
            return render(wrapper.current, AggregationVariableIcon, { variable });
        }
    }, [variable]);
    return <span ref={wrapper} />;
}

export function GameplayDashboardWrapper(props: GameplayDashboardProps) {
    const wrapper = useRef<HTMLDivElement>(null);

    const solidProps = useReactPropsToSolid(props);

    useEffect(() => {
        return render(wrapper.current!, GameplayDashboard, solidProps);
    }, [solidProps]);

    return <div ref={wrapper} />;
}

export function CompletionChartDocIconWrapper() {
    const wrapper = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return render(wrapper.current!, CompletionChartDocIcon, {});
    }, []);

    return <span ref={wrapper} />;
}

export function CompletionChartDocVarsWrapper() {
    const wrapper = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return render(wrapper.current!, CompletionChartDocVars, {});
    }, []);

    return <div ref={wrapper} />;
}

export function GeoChartDocIconWrapper() {
    const wrapper = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return render(wrapper.current!, GeoChartDocIcon, {});
    }, []);

    return <span ref={wrapper} />;
}

export function GeoChartDocVarsWrapper() {
    const wrapper = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return render(wrapper.current!, GeoChartDocVars, {});
    }, []);

    return <div ref={wrapper} />;
}

export function GrubsChartDocIconWrapper() {
    const wrapper = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return render(wrapper.current!, GrubsChartDocIcon, {});
    }, []);

    return <span ref={wrapper} />;
}

export function GrubsChartDocVarsWrapper() {
    const wrapper = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return render(wrapper.current!, GrubsChartDocVars, {});
    }, []);

    return <div ref={wrapper} />;
}

export function HealthChartDocIconWrapper() {
    const wrapper = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return render(wrapper.current!, HealthChartDocIcon, {});
    }, []);

    return <span ref={wrapper} />;
}

export function HealthChartDocVarsWrapper() {
    const wrapper = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return render(wrapper.current!, HealthChartDocVars, {});
    }, []);

    return <div ref={wrapper} />;
}

export function SoulChartDocIconWrapper() {
    const wrapper = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return render(wrapper.current!, SoulChartDocIcon, {});
    }, []);

    return <span ref={wrapper} />;
}

export function SoulChartDocVarsWrapper() {
    const wrapper = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return render(wrapper.current!, SoulChartDocVars, {});
    }, []);

    return <div ref={wrapper} />;
}

export function EssenceChartDocIconWrapper() {
    const wrapper = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return render(wrapper.current!, EssenceChartDocIcon, {});
    }, []);

    return <span ref={wrapper} />;
}

export function EssenceChartDocVarsWrapper() {
    const wrapper = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return render(wrapper.current!, EssenceChartDocVars, {});
    }, []);

    return <div ref={wrapper} />;
}
