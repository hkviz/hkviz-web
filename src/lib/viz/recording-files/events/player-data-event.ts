import { type PlayerDataField, type PlayerDataFieldValue } from '../../player-data/player-data';
import { type PlayerPositionEvent } from '../recording';
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
}
