import { type ReadonlySignal, type Signal } from '@preact/signals-react';

export function asReadonlySignal<T>(signal: Signal<T>): ReadonlySignal<T> {
    return signal;
}
