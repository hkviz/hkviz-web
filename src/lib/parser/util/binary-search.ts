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
