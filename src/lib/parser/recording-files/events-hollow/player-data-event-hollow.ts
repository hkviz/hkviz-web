import type {
	PlayerDataFieldNameHollow,
	PlayerDataFieldValueHollow,
} from '../../../game-data/hollow-data/player-data-hollow';
import type { EventCreationContext } from '../events-shared/event-creation-context';
import { type PlayerPositionEvent } from '../events-shared/player-position-event';
import { RecordingEventBase } from '../events-shared/recording-event-base';

export class PlayerDataEventHollow<TFieldName extends PlayerDataFieldNameHollow> extends RecordingEventBase {
	public previousPlayerPositionEvent: PlayerPositionEvent | null;
	public previousPlayerDataEventOfField: PlayerDataEventHollow<TFieldName> | null;
	public fieldName: TFieldName;
	public value: PlayerDataFieldValueHollow<TFieldName>;

	constructor(
		previousPlayerPositionEvent: PlayerPositionEvent | null,
		previousPlayerDataEventOfField: PlayerDataEventHollow<TFieldName> | null,
		field: TFieldName,
		value: PlayerDataFieldValueHollow<TFieldName>,
		ctx: EventCreationContext,
	) {
		super(ctx);
		this.previousPlayerPositionEvent = previousPlayerPositionEvent;
		this.fieldName = field;
		this.value = value;
		this.previousPlayerDataEventOfField = previousPlayerDataEventOfField;
	}
}
