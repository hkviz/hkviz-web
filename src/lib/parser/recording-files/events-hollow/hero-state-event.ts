import type { HeroStateField } from '../../hero-state';
import type { EventCreationContext } from '../events-shared/event-creation-context';
import type { PlayerPositionEvent } from '../events-shared/player-position-event';
import { RecordingEventBase } from '../events-shared/recording-event-base';

export class HeroStateEvent extends RecordingEventBase {
	public previousPlayerPositionEvent: PlayerPositionEvent | null = null;
	public readonly field: HeroStateField;
	public readonly value: boolean;

	constructor(
		previousPlayerPositionEvent: PlayerPositionEvent | null,
		field: HeroStateField,
		value: boolean,
		ctx: EventCreationContext,
	) {
		super(ctx);
		this.previousPlayerPositionEvent = previousPlayerPositionEvent;
		this.field = field;
		this.value = value;
	}
}
