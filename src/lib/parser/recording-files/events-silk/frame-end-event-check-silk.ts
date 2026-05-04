import { FrameEndEventBase } from '../events-shared/frame-end-event-base';
import type { RecordingEventBase } from '../events-shared/recording-event-base';
import type { FrameEndEventSilk } from './frame-end-event-silk';

export function isFrameEndEventSilk(event: RecordingEventBase): event is FrameEndEventSilk {
	return event instanceof FrameEndEventBase && event.game === 'silk';
}
