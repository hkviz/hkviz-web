import { formatTimeMs } from '../viz/util/time';

export const formatTimeMsVar = (ms: number | null) => {
	return ms != null ? formatTimeMs(ms) : 'N/A';
};

export const formatNumberVar = (value: number | null) => {
	return value != null ? value : 'N/A';
};
