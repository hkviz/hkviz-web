import { EventCreationContext } from '../events-shared/event-creation-context';
import { PlayerPositionEvent } from '../events-shared/player-position-event';
import { RecordingEventBase } from '../events-shared/recording-event-base';

export class SpellFireballEvent extends RecordingEventBase {
	public previousPlayerPositionEvent: PlayerPositionEvent | null = null;

	constructor(previousPlayerPositionEvent: PlayerPositionEvent | null, ctx: EventCreationContext) {
		super(ctx);
		this.previousPlayerPositionEvent = previousPlayerPositionEvent;
	}
}
