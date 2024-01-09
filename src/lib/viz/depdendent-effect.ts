import { useEffect, useMemo, useRef } from 'react';

// probably doesnt matter to much, but using a max for the count here, which makes it
// fit into a small integer: https://v8.dev/blog/pointer-compression
// which apparently is 2^30 on 32bit systems:
// https://medium.com/fhinkel/v8-internals-how-small-is-a-small-integer-e0badc18b6da
// with the modulo bellow, we will actually only use 2^29
const maxSmi = 2 ** 30;

export function useDynamicDependencies(dependencies: readonly unknown[]) {
    const countRef = useRef(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const count = useMemo(() => (countRef.current = (countRef.current + 1) % maxSmi), dependencies);
    return count;
}

export function useDependableEffect(create: () => void | (() => void), dependencies: readonly unknown[]) {
    const count = useDynamicDependencies(dependencies);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(create, [count]);
    return count;
}
