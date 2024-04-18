import { type Signal } from '@preact/signals-react';

export function signalRef<T extends HTMLElement | SVGElement>(element: Signal<T | null>) {
    return (el: T | null) => {
        // since all refs become null when the component is unmounted
        // here its just ignored, to avoid unnecessary re-calls of effects
        // as useSignal should be used to create the 'refs', they should be cleaned up
        // on component unmount. However this could create problems with conditionals
        // something to look into later.
        if (el === null) return;
        element.value = el;
    };
}
