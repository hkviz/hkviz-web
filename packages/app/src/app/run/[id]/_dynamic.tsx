'use client';
import { useEffect, useRef } from 'react';
import { renderRunSplits } from '@hkviz/viz/client-only';

export default function RunSplitsSolidWrapper() {
    const wrapper = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (wrapper.current) {
            return renderRunSplits(wrapper.current);
        }
    }, []);

    return <div ref={wrapper} />;
}
