import { Accessor, createMemo, createSignal, Setter, Signal, untrack } from 'solid-js';

// probably can be removed in solid v2
// as createSignal might be able to handle this
export function createMutableMemo<T>(getter: () => T): Signal<T> {
	const signal = createMemo(() => {
		const [get, set] = createSignal<T>(getter());
		return [get, set] as const;
	});

	const get: Accessor<T> = () => signal()[0]();
	 
	const set: Setter<T> = ((value: any) => untrack(() => signal()[1](value as any))) as Setter<T>;

	return [get, set] as const;
}
