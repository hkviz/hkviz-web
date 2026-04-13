import { createContext, createSignal, useContext } from 'solid-js';
import { AggregationVariable } from '~/lib/aggregation/aggregation-variable';

export function createAreaAnalyticsContext() {
	const [selectedVariable, setSelectedVariable] = createSignal<AggregationVariable | null>(null);

	function selectVariable(variable: AggregationVariable) {
		setSelectedVariable(variable);
	}

	function deselectVariable() {
		setSelectedVariable(null);
	}

	return {
		selectedVariable,
		selectVariable,
		deselectVariable,
	};
}

export type AreaAnalyticsContextType = ReturnType<typeof createAreaAnalyticsContext>;

export const AreaAnalyticsContext = createContext<AreaAnalyticsContextType>();

export function useAreaAnalyticsContext() {
	const context = useContext(AreaAnalyticsContext);
	if (!context) {
		throw new Error('useAreaAnalyticsContext must be used within a AreaAnalyticsContext.Provider');
	}
	return context;
}
