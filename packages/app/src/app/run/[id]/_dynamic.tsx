'use client';
import { type AggregationVariable } from '@hkviz/viz';
import { AggregationVariableIcon, GameplayDashboard, render, type GameplayDashboardProps } from '@hkviz/viz-ui';
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
    return <div ref={wrapper} />;
}

export function GameplayDashboardWrapper(props: GameplayDashboardProps) {
    const wrapper = useRef<HTMLDivElement>(null);

    const solidProps = useReactPropsToSolid(props);

    useEffect(() => {
        return render(wrapper.current!, GameplayDashboard, solidProps);
    }, [solidProps]);

    return <div ref={wrapper} />;
}
