import { createContext, createMemo, createSignal, onMount, useContext } from 'solid-js';

export function createAggregationDisplayStore() {
	const displayedValues: Set<() => number | null> = new Set();
	const [changeCount, setChangeCount] = createSignal(0);

	function createRegistration(getter: () => number | null) {
		displayedValues.add(getter);
		setChangeCount((c) => c + 1);
		onMount(() => {
			return () => {
				setChangeCount((c) => c - 1);
				displayedValues.delete(getter);
			};
		});
	}

	const minValue = createMemo(() => {
		changeCount(); // track changes
		let minValue: number | null = null;
		for (const getter of displayedValues) {
			const value = getter();
			if (value != null && (minValue == null || value < minValue)) {
				minValue = value;
			}
		}
		return minValue;
	});

	const maxValue = createMemo(() => {
		changeCount(); // track changes
		let maxValue: number | null = null;
		for (const getter of displayedValues) {
			const value = getter();
			if (value != null && (maxValue == null || value > maxValue)) {
				maxValue = value;
			}
		}
		return maxValue;
	});

	return {
		minValue,
		maxValue,
		createRegistration,
	};
}
export type AggregationDisplayStore = ReturnType<typeof createAggregationDisplayStore>;

export const AggregationDisplayStoreContext = createContext<AggregationDisplayStore>();

export function useAggregationDisplayStore() {
	const store = useContext(AggregationDisplayStoreContext);
	if (!store) throw new Error('No AggregationDisplayStoreContext provided');
	return store;
}
