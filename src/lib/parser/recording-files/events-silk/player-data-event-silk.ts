import {
	PlayerDataFieldNameSilk,
	PlayerDataFieldValueSilk,
} from '~/lib/game-data/silk-data/player-data-silk.generated';
import { EventCreationContext } from '../events-shared/event-creation-context';
import { type PlayerPositionEvent } from '../events-shared/player-position-event';
import { RecordingEventBase } from '../events-shared/recording-event-base';

export class PlayerDataEventSilk<TFieldName extends PlayerDataFieldNameSilk> extends RecordingEventBase {
	public previousPlayerPositionEvent: PlayerPositionEvent | null;
	public previousPlayerDataEventOfField: PlayerDataEventSilk<TFieldName> | null;
	public fieldName: TFieldName;
	public value: PlayerDataFieldValueSilk<TFieldName>;

	constructor(
		previousPlayerPositionEvent: PlayerPositionEvent | null,
		previousPlayerDataEventOfField: PlayerDataEventSilk<TFieldName> | null,
		fieldName: TFieldName,
		value: PlayerDataFieldValueSilk<TFieldName>,
		ctx: EventCreationContext,
	) {
		super(ctx);
		this.previousPlayerPositionEvent = previousPlayerPositionEvent;
		this.fieldName = fieldName;
		this.value = value;
		this.previousPlayerDataEventOfField = previousPlayerDataEventOfField;
	}
}
