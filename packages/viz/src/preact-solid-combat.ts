import { type Accessor, type Setter, createSignal as createSignalSolid, untrack, batch as batchSolid } from 'solid-js';
import { type ReadonlySignal, signal, batch as batchPreact } from '@preact/signals-react';

export type CombatAccessor<T> = Accessor<T> & {
    get valuePreact(): T;
    rawPreactSignal: ReadonlySignal<T>;
    peekPreact(): T;
};

export function createSignal<T>(value: T): [CombatAccessor<T>, Setter<T>] {
    const [getter, setterSolid] = createSignalSolid<T>(value);
    const statePreact = signal<T>(value);

    Object.defineProperty(getter, 'valuePreact', {
        get: function () {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return statePreact.value;
        },
    });
    (getter as any).rawPreactSignal = statePreact;
    (getter as any).peekPreact = () => statePreact.peek();

    const setter = (value: any) => {
        untrack(() => {
            setterSolid(value);
            statePreact.value = getter();
        });
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return [getter as any, setter as Setter<T>];
}

export function batch(cb: () => void) {
    batchPreact(() => {
        batchSolid(cb);
    });
}
