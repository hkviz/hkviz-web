import { AggregationVariable } from './store/aggregations/aggregate-recording';

export function roomInfoColoringToggleClasses(variable: AggregationVariable) {
	return 'room-info-coloring-toggle_' + variable;
}
