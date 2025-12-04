/* eslint-disable solid/reactivity */
import { Accessor, createMemo, Setter, Signal } from 'solid-js';
import { expect, test } from 'vitest';
import { AppendOnlySignalArray, createAppendOnlyReactiveArray, ReadonlyArrayish } from './append-only-signal-array';

interface TestAppendOnlySignalArray<T> extends AppendOnlySignalArray<T> {
	_items: T[];
	_signalPerIndex: Map<number, Signal<T | undefined>>;
	_getLength: Accessor<number>;
	_setLength: Setter<number>;
}

test('does not create signal for already existing value', () => {
	const arr = createAppendOnlyReactiveArray([1, 2, 3]) as TestAppendOnlySignalArray<number>;
	const x = createMemo(() => arr[0]);
	expect(x()).toBe(1);
	expect(arr._signalPerIndex.size).toBe(0);
	arr._items[0] = 4;
	// should not update, since no signal was created internally.
	expect(x()).toBe(1);
	// read would still be 2, but can only happen when types are ignored
	expect(arr[0]).toBe(4);
	expect(arr._signalPerIndex.size).toBe(0);
});

test('creates signal for non existing value', () => {
	const arr = createAppendOnlyReactiveArray([1, 2, 3]) as TestAppendOnlySignalArray<number>;
	expect(arr._signalPerIndex.size).toBe(0);
	const x = createMemo(() => arr[3]);

	expect(arr._signalPerIndex.size).toBe(1);
	expect(x()).toBe(undefined);

	arr.push(4);
	expect(arr._signalPerIndex.size).toBe(0);
	expect(x()).toBe(4);
	expect(arr[3]).toBe(4);
});

test('length is reactive', () => {
	const arr = createAppendOnlyReactiveArray([] as number[]) as TestAppendOnlySignalArray<number>;
	const x = createMemo(() => arr.length);

	expect(x()).toBe(0);
	expect(arr._signalPerIndex.size).toBe(0);

	arr.push(1);
	expect(x()).toBe(1);
	expect(arr._signalPerIndex.size).toBe(0);

	arr.push(2, 3);
	expect(x()).toBe(3);
	expect(arr._signalPerIndex.size).toBe(0);
});

test('at(-1) is reactive', () => {
	const arr = createAppendOnlyReactiveArray([] as number[]) as TestAppendOnlySignalArray<number>;
	const x = createMemo(() => arr.at(-1));

	expect(x()).toBe(undefined);
	expect(arr._signalPerIndex.size).toBe(0);

	arr.push(1);
	expect(x()).toBe(1);
	expect(arr._signalPerIndex.size).toBe(0);

	arr.push(2, 3);
	expect(x()).toBe(3);
	expect(arr._signalPerIndex.size).toBe(0);
});

test('at(-2) is reactive', () => {
	const arr = createAppendOnlyReactiveArray([] as number[]) as TestAppendOnlySignalArray<number>;
	const x = createMemo(() => arr.at(-2));

	expect(x()).toBe(undefined);
	expect(arr._signalPerIndex.size).toBe(0);

	arr.push(1);
	expect(x()).toBe(undefined);
	expect(arr._signalPerIndex.size).toBe(0);

	arr.push(2);
	expect(x()).toBe(1);
	expect(arr._signalPerIndex.size).toBe(0);

	arr.push(3, 4);
	expect(x()).toBe(3);
	expect(arr._signalPerIndex.size).toBe(0);
});

test('types are assignable', () => {
	const reactiveArr = createAppendOnlyReactiveArray(
		[] as number[],
	) satisfies ArrayLike<number> satisfies ReadonlyArrayish<number>;
	const unreactiveArr = [] as number[] satisfies ArrayLike<number> satisfies ReadonlyArrayish<number>;

	expect(reactiveArr.length).toBe(0);
	expect(unreactiveArr.length).toBe(0);
});
