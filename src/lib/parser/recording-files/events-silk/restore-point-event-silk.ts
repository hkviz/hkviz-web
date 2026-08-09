import type { EventCreationContext } from '../events-shared/event-creation-context';
import { RecordingEventBase } from '../events-shared/recording-event-base';

// Brackets a restore point's events, as originally written by the mod. number is the restore
// point's own Silksong-assigned number, date is its in-game save date. Only used while combining -
// stripped out before the events reach CombinedRecordingSilk.
export class RestorePointStartEventSilk extends RecordingEventBase {
	constructor(
		public readonly number: number,
		public readonly date: string,
		ctx: EventCreationContext,
	) {
		super(ctx);
	}
}

export class RestorePointFinishEventSilk extends RecordingEventBase {
	constructor(ctx: EventCreationContext) {
		super(ctx);
	}
}
