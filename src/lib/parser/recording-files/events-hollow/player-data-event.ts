import {
	type PlayerDataFieldHollow,
	type PlayerDataFieldValueHollow,
} from '../../../game-data/hollow-data/player-data-hollow';
import { EventCreationContext } from '../events-shared/event-creation-context';
import { type PlayerPositionEvent } from '../events-shared/player-position-event';
import { RecordingEventBase } from '../events-shared/recording-event-base';

export class PlayerDataEventHollow<TField extends PlayerDataFieldHollow> extends RecordingEventBase {
	public previousPlayerPositionEvent: PlayerPositionEvent | null;
	public previousPlayerDataEventOfField: PlayerDataEventHollow<TField> | null;
	public field: TField;
	public value: PlayerDataFieldValueHollow<TField>;

	constructor(
		previousPlayerPositionEvent: PlayerPositionEvent | null,
		previousPlayerDataEventOfField: PlayerDataEventHollow<TField> | null,
		field: TField,
		value: PlayerDataFieldValueHollow<TField>,
		ctx: EventCreationContext,
	) {
		super(ctx);
		this.previousPlayerPositionEvent = previousPlayerPositionEvent;
		this.field = field;
		this.value = value;
		this.previousPlayerDataEventOfField = previousPlayerDataEventOfField;
	}
}
