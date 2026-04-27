import { EventCreationContext } from './event-creation-context';
import { RecordingEventBase } from './recording-event-base';

export abstract class FrameEndEventBase extends RecordingEventBase {
	constructor(ctx: EventCreationContext) {
		super(ctx);
	}
}
