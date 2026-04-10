import { EventCreationContext } from '../events-shared/event-creation-context';
import { RecordingEventBase } from '../events-shared/recording-event-base';
import { PlayerPositionEvent } from './player-position-event';

export class SpellDownEvent extends RecordingEventBase {
	public previousPlayerPositionEvent: PlayerPositionEvent | null = null;

	constructor(previousPlayerPositionEvent: PlayerPositionEvent | null, ctx: EventCreationContext) {
		super(ctx);
		this.previousPlayerPositionEvent = previousPlayerPositionEvent;
	}
}
