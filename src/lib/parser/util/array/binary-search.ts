import { lengthUntracked, ReadonlyArrayish } from './append-only-signal-array';

/**
 * Binary search for the first element that is greater than or equal to the value.
 * @param arr array sorted by getValue(arr[i]) in ascending order
 * @param value value to search for
 * @param getValue function to get the value from the array element to compare with the value
 * @returns -1 if value is smaller than the getValue(arr[0]) or arr.length === 0 or the index of the last element that is smaller than the value.
 */
export function binarySearchLastIndexBefore<T>(
	arr: ReadonlyArrayish<T>,
	value: number,
	getValue: (v: T) => number,
): number {
	let low = 0;
	let high = lengthUntracked(arr) - 1;
	while (low <= high) {
		const mid = (low + high) >>> 1;
		const midValue = getValue(arr[mid]!);
		if (midValue <= value) {
			low = mid + 1;
		} else {
			high = mid - 1;
		}
	}
	if (high === -1) {
		// when its not found it could be found after pushing new elements
		// when its found it is not dependent on length / at least only dependent
		// on the values already in the array. Which might reactive.
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		arr.length;
	}
	return high;
}

export function binarySearchLastIndexBeforeUnreactive<T>(
	arr: readonly T[],
	value: number,
	getValue: (v: T) => number,
): number {
	let low = 0;
	let high = arr.length - 1;
	while (low <= high) {
		const mid = (low + high) >>> 1;
		const midValue = getValue(arr[mid]!);
		if (midValue <= value) {
			low = mid + 1;
		} else {
			high = mid - 1;
		}
	}
	return high;
}
