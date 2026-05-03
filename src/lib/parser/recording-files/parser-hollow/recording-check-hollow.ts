import type { CombinedRecordingAny } from '../parser-specific/combined-recording';
import type { CombinedRecordingHollow } from './recording-hollow';

export function isCombinedRecordingHollow(recording: CombinedRecordingAny): recording is CombinedRecordingHollow {
	return recording.gameId === 'hollow';
}
