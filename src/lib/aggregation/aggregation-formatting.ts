import { BEFORE_RECORDING_STEP_MS } from '../parser/recording-files/parser-shared/before-recording';
import { formatTimeMs } from '../viz/util/time';

export const formatTimeMsVar = (ms: number | null) => {
	return ms != null ? formatTimeMs(ms) : 'N/A';
};

export const formatMsIntoGameVar = (ms: number | null) => {
	if (ms == null) {
		return 'N/A';
	}
	if (ms < 0) {
		const step = Math.ceil(-ms / BEFORE_RECORDING_STEP_MS);
		return 'T-' + step;
	}
	return formatTimeMs(ms);
};

export const formatNumberVar = (value: number | null) => {
	return value != null ? value : 'N/A';
};
