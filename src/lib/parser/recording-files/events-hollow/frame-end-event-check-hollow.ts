import { FrameEndEventBase } from '../events-shared/frame-end-event-base';
import type { RecordingEventBase } from '../events-shared/recording-event-base';
import type { FrameEndEventHollow } from './frame-end-event-hollow';

export function isFrameEndEventHollow(event: RecordingEventBase): event is FrameEndEventHollow {
	return event instanceof FrameEndEventBase && event.constructor.name === 'FrameEndEventHollow';
}
