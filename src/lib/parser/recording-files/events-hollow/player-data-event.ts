import { type PlayerDataField, type PlayerDataFieldValue } from '../../player-data/player-data';
import { EventCreationContext } from '../events-shared/event-creation-context';
import { type PlayerPositionEvent } from '../events-shared/player-position-event';
import { RecordingEventBase } from '../events-shared/recording-event-base';

export class PlayerDataEvent<TField extends PlayerDataField> extends RecordingEventBase {
	public previousPlayerPositionEvent: PlayerPositionEvent | null;
	public previousPlayerDataEventOfField: PlayerDataEvent<TField> | null;
	public field: TField;
	public value: PlayerDataFieldValue<TField>;

	constructor(
		previousPlayerPositionEvent: PlayerPositionEvent | null,
		previousPlayerDataEventOfField: PlayerDataEvent<TField> | null,
		field: TField,
		value: PlayerDataFieldValue<TField>,
		ctx: EventCreationContext,
	) {
		super(ctx);
		this.previousPlayerPositionEvent = previousPlayerPositionEvent;
		this.field = field;
		this.value = value;
		this.previousPlayerDataEventOfField = previousPlayerDataEventOfField;
	}
}
