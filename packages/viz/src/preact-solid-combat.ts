import { type Accessor, type Setter, createSignal as createSignalSolid, untrack } from 'solid-js';
import { ReadonlySignal, signal } from '@preact/signals-react';

export type CombatAccessor<T> = Accessor<T> & { get valuePreact(): T; rawPreactSignal: ReadonlySignal<T> };

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

    const setter = (value: any) => {
        untrack(() => {
            setterSolid(value);
            statePreact.value = getter();
        });
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return [getter as any, setter as Setter<T>];
}
