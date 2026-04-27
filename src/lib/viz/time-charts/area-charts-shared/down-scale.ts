import { FrameEndEventBase } from '~/lib/parser/recording-files/events-shared/frame-end-event-base';
import { getChartVarValue, LineChartVariableDescription } from './area-chart-variable';

export function downScale(
	data: FrameEndEventBase[],
	fields: LineChartVariableDescription[],
	maxTimeDelta = 10000,
): FrameEndEventBase[] {
	if (data.length <= 2) {
		return [...data];
	}

	// Keep first/last points so chart boundaries remain stable.
	const filtered: FrameEndEventBase[] = [data[0]];
	let lastIncluded = data[0];

	for (let i = 1; i < data.length - 1; i++) {
		const previous = data[i - 1];
		const current = data[i];
		const next = data[i + 1];

		let didAnyChange = false;
		let isAnyExtrema = false;

		for (const field of fields) {
			const previousValue = getChartVarValue(previous, field);
			const currentValue = getChartVarValue(current, field);
			const nextValue = getChartVarValue(next, field);

			didAnyChange ||= currentValue !== previousValue;

			isAnyExtrema ||=
				(currentValue < previousValue && currentValue <= nextValue) ||
				(currentValue <= previousValue && currentValue < nextValue) ||
				(currentValue > previousValue && currentValue >= nextValue) ||
				(currentValue >= previousValue && currentValue > nextValue);

			if (didAnyChange && isAnyExtrema) {
				break;
			}
		}

		const exceededMaxTimeDelta = current.msIntoGame - lastIncluded.msIntoGame > maxTimeDelta;
		if ((exceededMaxTimeDelta || isAnyExtrema) && didAnyChange) {
			filtered.push(current);
			lastIncluded = current;
		}
	}

	filtered.push(data[data.length - 1]);
	return filtered;
}
