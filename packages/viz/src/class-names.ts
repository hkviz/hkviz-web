import { type AggregationVariable } from './store';

export function roomInfoColoringToggleClasses(variable: AggregationVariable) {
    return 'room-info-coloring-toggle_' + variable;
}
