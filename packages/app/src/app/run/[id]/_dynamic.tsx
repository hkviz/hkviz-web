'use client';
import { cn } from '@/lib/utils';
import { type AggregationVariable } from '@hkviz/viz';
import {
    RightCard,
    render,
    renderAggregationVariableIcon,
    renderAnimationOptions,
    renderDashboardMapOptions,
    renderHkMapRooms,
    type HkMapRoomsProps,
} from '@hkviz/viz-ui';
import { useSignals } from '@preact/signals-react/runtime';
import { useEffect, useRef, useState } from 'react';
import { createStore } from 'solid-js/store';
import { uiStore } from '~/lib/stores/ui-store';

function useReactPropsToSolid<T extends object>(props: T) {
    const [[get, set]] = useState(() => createStore(props));

    set(props);

    return get;
}

export function HkMapRoomsWrapper(props: HkMapRoomsProps) {
    const roomWrapperRef = useRef<SVGGElement>(null);

    const solidProps = useReactPropsToSolid(props);

    useEffect(() => {
        console.log(roomWrapperRef, solidProps);
        return renderHkMapRooms(solidProps, roomWrapperRef.current!);
    }, [solidProps]);

    return <g ref={roomWrapperRef} />;
}

export const DashboardMapOptionsWrapper = function RoomInfoWrapper() {
    useSignals();
    const roomWrapperRef = useRef<HTMLDivElement>(null);
    const mobileTab = uiStore.mobileTab.valuePreact;

    useEffect(() => {
        if (roomWrapperRef.current) {
            return renderDashboardMapOptions(roomWrapperRef.current);
        }
    }, []);

    return (
        <div
            ref={roomWrapperRef}
            className={cn('dashboard-grid-map-options', mobileTab === 'map' ? 'flex' : 'hidden lg:flex')}
        ></div>
    );
};

export function AggregationVariableIconWrapper({ variable }: { variable: AggregationVariable }) {
    const wrapper = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (wrapper.current) {
            return renderAggregationVariableIcon(variable, wrapper.current);
        }
    }, [variable]);
    return <div ref={wrapper} />;
}

export function AnimationOptionsWrapper({ className }: { className: string }) {
    const wrapper = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (wrapper.current) {
            return renderAnimationOptions('', wrapper.current);
        }
    }, []);
    return <div ref={wrapper} className={className} />;
}

export function RightCardWrapper() {
    const wrapper = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return render(wrapper.current!, RightCard, {});
    }, []);

    return <div className="dashboard-grid-splits-and-timecharts flex" ref={wrapper} />;
}
