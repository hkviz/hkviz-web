import { EventCreationContext } from '../events-shared/event-creation-context';
import { RecordingEventBase } from '../events-shared/recording-event-base';

export class FrameEndEventSilk extends RecordingEventBase {
	public constructor(ctx: EventCreationContext) {
		super(ctx);
	}
}
