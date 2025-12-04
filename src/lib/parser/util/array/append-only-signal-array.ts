// export function createAppendOnlySignalArray<T>(initialValue: T[]): AppendOnlySignalArray<T> {
//     let _value = initialValue;
//     const [_get, _set] = createSignal<T[]>(initialValue);

//     function get(): T[] {
//         return _get();
//     }
//     const set: Setter<T[]> = ((v: any) => {
//         throw new Error('Cannot set value of append-only signal array');
//     }) as any;

//     function append(value: T) {
//         _set([..._get(), value]);
//     }

//     return { get, set, append };
// }

import { Accessor, batch, createSignal, Setter, Signal } from 'solid-js';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
type NotFunction<T> = T extends Function ? never : T;

export interface ReadonlyArrayish<T> {
	readonly [index: number]: T;
	readonly at: (index: number) => T | undefined;
	readonly length: number;
	readonly [Symbol.iterator]: () => IterableIterator<T>;

	readonly find: (predicate: (value: T, index: number) => unknown) => T | undefined;
	readonly findIndex: (predicate: (value: T, index: number) => unknown) => number;
	readonly findLast: (predicate: (value: T, index: number) => unknown) => T | undefined;
	readonly findLastIndex: (predicate: (value: T, index: number) => unknown) => number;

	readonly filter: (predicate: (value: T, index: number) => unknown) => T[];
	readonly map: <U>(callbackfn: (value: T, index: number) => U) => U[];
}

export interface Arrayish<T> extends ReadonlyArrayish<T> {
	readonly push: (...values: T[]) => number;
}

const REACTIVE_ARRAY = Symbol('ReactiveArray');
export interface ReactiveArray<T> extends Arrayish<T> {
	[REACTIVE_ARRAY]: true;
	lengthUntracked: number;
}

const APPEND_ONLY_REACTIVE_ARRAY_SYMBOL = Symbol('AppendOnlyReactiveArray');
export interface AppendOnlySignalArray<T> extends ReactiveArray<T> {
	[APPEND_ONLY_REACTIVE_ARRAY_SYMBOL]: true;
	unwrap(): T[];
}

export type AppendOnlyOrArray<T> = AppendOnlySignalArray<T> | T[];
export type AppendOnlyOrReadOnlyArray<T> = AppendOnlySignalArray<T> | readonly T[];

export class InternalAppendOnlyReactiveArray<T> implements Omit<AppendOnlySignalArray<T>, number> {
	[APPEND_ONLY_REACTIVE_ARRAY_SYMBOL] = true as const;
	[REACTIVE_ARRAY] = true as const;
	private _items: T[];
	private _signalPerIndex: Map<number, Signal<T | undefined>> = new Map();
	private _getLength: Accessor<number>;
	private _setLength: Setter<number>;

	constructor(values: T[]) {
		this._items = values;
		// eslint-disable-next-line solid/reactivity
		[this._getLength, this._setLength] = createSignal(values.length);
	}

	get(index: number): T | undefined {
		if (index < this._items.length) {
			return this._items[index];
		}
		const existingSignal = this._signalPerIndex.get(index);
		if (existingSignal) {
			return existingSignal[0]();
		}
		// eslint-disable-next-line solid/reactivity
		const newSignal = createSignal<T | undefined>(undefined);
		this._signalPerIndex.set(index, newSignal);
		return newSignal[0]();
	}

	at(index: number): T | undefined {
		return index >= 0 ? this.get(index) : this.get(this._getLength() + index);
	}

	push(...newItems: T[]): number {
		return batch(() => {
			for (const item of newItems) {
				const index = this._items.length;
				this._items.push(item);
				const signal = this._signalPerIndex.get(index);
				if (signal) {
					// functions should not be put into the array directly. The typesystem prevents this,
					// so its fine, but if somebody ignores the types it would be undefined behavior (to me :D)
					signal[1](item as NotFunction<T>);
				}
				this._signalPerIndex.delete(index);
			}
			this._setLength(this._items.length);
			return this._items.length;
		});
	}

	get length() {
		return this._getLength();
	}

	get lengthUntracked() {
		return this._items.length;
	}

	unwrap(): T[] {
		return this._items;
	}

	findIndex: Array<T>['findIndex'] = (callbackfn: (value: T, index: number, array: T[]) => unknown) => {
		const index = this._items.findIndex(callbackfn);
		if (index !== -1) {
			return index;
		}
		// could be impacted by appending new elements
		this._getLength();
		return -1;
	};

	find: Array<T>['find'] = (callbackfn: (value: T, index: number, array: T[]) => unknown) => {
		const value = this._items.find(callbackfn);
		if (value !== undefined) {
			return value;
		}
		// could be impacted by appending new elements
		this._getLength();
		return undefined;
	};

	map: Array<T>['map'] = <U>(callbackfn: (value: T, index: number, array: T[]) => U) => {
		// always depends on length.
		this._getLength();
		return this._items.map(callbackfn);
	};

	filter(predicate: (value: T, index: number, array: T[]) => unknown): T[] {
		// always depends on length
		this._getLength();
		return this._items.filter(predicate);
	}

	findLastIndex(predicate: (value: T, index: number, array: T[]) => unknown): number {
		// always depends on length
		this._getLength();
		return this._items.findLastIndex(predicate);
	}

	findLast(predicate: (value: T, index: number, array: T[]) => unknown): T | undefined {
		// always depends on length
		this._getLength();
		return this._items.findLast(predicate);
	}

	[Symbol.iterator](): IterableIterator<T> {
		// always depends on length
		this._getLength();
		return this._items[Symbol.iterator]();
	}
}

export function createAppendOnlyReactiveArray<T>(values: NotFunction<T>[]): AppendOnlySignalArray<NotFunction<T>> {
	const internalArray = new InternalAppendOnlyReactiveArray(values);

	// Use a Proxy to intercept numeric index access (e.g. arr[0]).
	return new Proxy(internalArray as unknown as AppendOnlySignalArray<NotFunction<T>>, {
		get(target, prop, receiver) {
			if (typeof prop === 'string' && /^\d+$/.test(prop)) {
				const index = Number(prop);
				return internalArray.get(index);
			}
			return Reflect.get(target, prop, receiver);
		},
	});
}

export function isReactiveArray<T>(arr: ReadonlyArrayish<T>): arr is ReactiveArray<T> {
	return (arr as any)[REACTIVE_ARRAY] === true;
}

export function isAppendOnlyReactiveArray<T>(arr: ReadonlyArrayish<T>): arr is AppendOnlySignalArray<T> {
	return (arr as any)[APPEND_ONLY_REACTIVE_ARRAY_SYMBOL] === true;
}

export function lengthUntracked<T>(arr: ReadonlyArrayish<T>): number {
	return isReactiveArray(arr) ? arr.lengthUntracked : arr.length;
}
