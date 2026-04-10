import { EventCreationContext } from '../events-shared/event-creation-context';
import { RecordingEventBase } from '../events-shared/recording-event-base';

export class HKVizModVersionEvent extends RecordingEventBase {
	public version: string;

	constructor(version: string, ctx: EventCreationContext) {
		super(ctx);
		this.version = version;
	}
}
