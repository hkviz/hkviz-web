export const COLLECTION_DIFF = Symbol('collection_diff');

export abstract class CollectionDiff<T> {
	[COLLECTION_DIFF] = true;

	abstract combineOnto(previous: T): T;
}

export function isCollectionDiff(value: unknown): value is CollectionDiff<unknown> {
	return typeof value === 'object' && value !== null && (value as CollectionDiff<unknown>)[COLLECTION_DIFF] === true;
}

export function collectionDiffApply<T>(previous: T, diff: T | CollectionDiff<T>): T {
	if (diff === null || diff === undefined) {
		return diff;
	}

	if (isCollectionDiff(diff)) {
		// console.log('Flattening collection diff with previous value', { previous, diff });
		return diff.combineOnto(previous) as T;
	} else {
		return diff as T;
	}
}
