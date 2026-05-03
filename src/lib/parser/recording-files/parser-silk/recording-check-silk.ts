import type { CombinedRecordingAny } from '../parser-specific/combined-recording';
import type { CombinedRecordingSilk } from './recording-silk';

export function isCombinedRecordingSilk(recording: CombinedRecordingAny): recording is CombinedRecordingSilk {
	return recording.gameId === 'silk';
}
