import { PlayerDataFieldSilk, PlayerDataFieldValueSilk } from '~/lib/game-data/silk-data/player-data-silk';
import { EventCreationContext } from '../events-shared/event-creation-context';
import { type PlayerPositionEvent } from '../events-shared/player-position-event';
import { RecordingEventBase } from '../events-shared/recording-event-base';

export class PlayerDataEventSilk<TField extends PlayerDataFieldSilk> extends RecordingEventBase {
	public previousPlayerPositionEvent: PlayerPositionEvent | null;
	public previousPlayerDataEventOfField: PlayerDataEventSilk<TField> | null;
	public field: TField;
	public value: PlayerDataFieldValueSilk<TField>;

	constructor(
		previousPlayerPositionEvent: PlayerPositionEvent | null,
		previousPlayerDataEventOfField: PlayerDataEventSilk<TField> | null,
		field: TField,
		value: PlayerDataFieldValueSilk<TField>,
		ctx: EventCreationContext,
	) {
		super(ctx);
		this.previousPlayerPositionEvent = previousPlayerPositionEvent;
		this.field = field;
		this.value = value;
		this.previousPlayerDataEventOfField = previousPlayerDataEventOfField;
	}
}
