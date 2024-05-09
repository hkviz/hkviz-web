import { type HkMapRoomsProps, renderHkMapRooms } from '@hkviz/viz-ui';
import { memo, useEffect, useRef, useState } from 'react';

export default memo(function HkMapRoomsWrapper(props: HkMapRoomsProps) {
    const roomWrapperRef = useRef<SVGGElement>(null);

    useEffect(() => {
        console.log(roomWrapperRef, props);
        if (roomWrapperRef.current) {
            return renderHkMapRooms(props, roomWrapperRef.current);
        }
    });

    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(true);
    }, []);

    if (!show) return <></>;

    return <g ref={roomWrapperRef} />;
});
