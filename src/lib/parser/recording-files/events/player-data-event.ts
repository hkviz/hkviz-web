import { AbilityOrItemField, isPlayerDataAbilityOrItemField } from '../../player-data/abilities';
import {
	isPlayerDataDefeatedField,
	isPlayerDataKilledField,
	PlayerDataDefeatedField,
	PlayerDataKilledField,
	type PlayerDataField,
	type PlayerDataFieldValue,
} from '../../player-data/player-data';
import { type PlayerPositionEvent } from './player-position-event';
import { RecordingEventBase, type RecordingEventBaseOptions } from './recording-event-base';

export type PlayerDataEventOptions<TField extends PlayerDataField> = RecordingEventBaseOptions &
	Pick<PlayerDataEvent<TField>, 'field' | 'value' | 'previousPlayerPositionEvent' | 'previousPlayerDataEventOfField'>;
export class PlayerDataEvent<TField extends PlayerDataField> extends RecordingEventBase {
	public previousPlayerPositionEvent: PlayerPositionEvent | null;
	public previousPlayerDataEventOfField: PlayerDataEvent<TField> | null;
	public field: TField;
	public value: PlayerDataFieldValue<TField>;

	constructor(options: PlayerDataEventOptions<TField>) {
		super(options);
		this.previousPlayerPositionEvent = options.previousPlayerPositionEvent;
		this.field = options.field;
		this.value = options.value;
		this.previousPlayerDataEventOfField = options.previousPlayerDataEventOfField;
	}

	public isOfField<TFieldCheck extends PlayerDataField>(field: TFieldCheck): this is PlayerDataEvent<TFieldCheck> {
		return (this.field as unknown) === field;
	}

	public isOfDefeatedField(): this is PlayerDataEvent<PlayerDataDefeatedField> {
		return isPlayerDataDefeatedField(this.field);
	}

	public isOfKilledField(): this is PlayerDataEvent<PlayerDataKilledField> {
		return isPlayerDataKilledField(this.field);
	}

	public isOfAbilityOrItemField(): this is PlayerDataEvent<AbilityOrItemField> {
		return isPlayerDataAbilityOrItemField(this.field);
	}
}
