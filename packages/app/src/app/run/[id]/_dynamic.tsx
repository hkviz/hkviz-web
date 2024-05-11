'use client';
import { cn } from '@/lib/utils';
import { type AggregationVariable } from '@hkviz/viz';
import {
    renderHkMapRooms,
    renderRunSplits,
    renderAggregationVariableIcon,
    renderAnimationOptions,
    type HkMapRoomsProps,
    renderDashboardMapOptions,
} from '@hkviz/viz-ui';
import { useSignals } from '@preact/signals-react/runtime';
import { memo, useEffect, useRef, useState } from 'react';
import { createStore } from 'solid-js/store';
import { uiStore } from '~/lib/stores/ui-store';

function useReactPropsToSolid<T extends object>(props: T) {
    const [[get, set]] = useState(() => createStore(props));

    set(props);

    return get;
}

export function RunSplitsSolidWrapper() {
    const wrapper = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (wrapper.current) {
            return renderRunSplits(wrapper.current);
        }
    }, []);

    return <div ref={wrapper} />;
}

export const HkMapRoomsWrapper = memo(function HkMapRoomsWrapper(props: HkMapRoomsProps) {
    const roomWrapperRef = useRef<SVGGElement>(null);

    const solidProps = useReactPropsToSolid(props);

    useEffect(() => {
        console.log(roomWrapperRef, solidProps);
        return renderHkMapRooms(solidProps, roomWrapperRef.current!);
    }, [solidProps]);

    return <g ref={roomWrapperRef} />;
});

export const DashboardMapOptionsWrapper = memo(function RoomInfoWrapper() {
    useSignals();
    const roomWrapperRef = useRef<HTMLDivElement>(null);
    const mobileTab = uiStore.mobileTab.valuePreact;

    useEffect(() => {
        if (roomWrapperRef.current) {
            return renderDashboardMapOptions(roomWrapperRef.current);
        }
    });

    return (
        <div
            ref={roomWrapperRef}
            className={cn('dashboard-grid-map-options', mobileTab === 'map' ? 'flex' : 'hidden lg:flex')}
        ></div>
    );
});

export const AggregationVariableIconWrapper = memo(function AggregationVariableIconWrapper({
    variable,
}: {
    variable: AggregationVariable;
}) {
    const wrapper = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (wrapper.current) {
            return renderAggregationVariableIcon(variable, wrapper.current);
        }
    }, [variable]);
    return <div ref={wrapper} />;
});

export const AnimationOptionsWrapper = memo(function AnimationOptionsWrapper({ className }: { className: string }) {
    const wrapper = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (wrapper.current) {
            return renderAnimationOptions('', wrapper.current);
        }
    }, []);
    return <div ref={wrapper} className={className} />;
});
