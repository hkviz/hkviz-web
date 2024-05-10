'use client';
import { type AggregationVariable } from '@hkviz/viz';
import {
    renderHkMapRooms,
    renderRunSplits,
    renderAggregationVariableIcon,
    type HkMapRoomsProps,
    renderRoomInfo,
} from '@hkviz/viz-ui';
import { memo, useEffect, useRef, useState } from 'react';
import { createStore } from 'solid-js/store';

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

export const RoomInfoWrapper = memo(function RoomInfoWrapper() {
    const roomWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (roomWrapperRef.current) {
            return renderRoomInfo(roomWrapperRef.current);
        }
    });
    return <div ref={roomWrapperRef} className="relative flex shrink grow" />;
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
