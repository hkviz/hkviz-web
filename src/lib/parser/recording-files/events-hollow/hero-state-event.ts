import { HeroStateField } from '../../hero-state';
import { EventCreationContext } from '../events-shared/event-creation-context';
import { RecordingEventBase } from '../events-shared/recording-event-base';
import { PlayerPositionEvent } from './player-position-event';

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
