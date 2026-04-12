/**
 * Binary search for the first element that is greater than or equal to the value.
 * @param arr array sorted by getValue(arr[i]) in ascending order
 * @param value value to search for
 * @param getValue function to get the value from the array element to compare with the value
 * @returns -1 if value is smaller than the getValue(arr[0]) or arr.length === 0 or the index of the last element that is smaller than the value.
 */
export function binarySearchLastIndexBefore<T>(arr: readonly T[], value: number, getValue: (v: T) => number): number {
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
