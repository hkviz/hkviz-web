import { PlayerDataEventSilk } from '~/lib/parser/recording-files/events-silk/player-data-event-silk';
import { PlayerDataFieldNameSilk } from './player-data-silk.generated';

export { playerDataFieldsSilk } from './player-data-silk.generated';

export function isPlayerDataEventOfFieldSilk<TFieldName extends PlayerDataFieldNameSilk>(
	event: unknown,
	fieldName: TFieldName,
): event is PlayerDataEventSilk<TFieldName> {
	return event instanceof PlayerDataEventSilk && event.fieldName === fieldName;
}

// export function isPlayerDataEventWithFieldTypeSilk<FieldType extends PlayerDataFieldTypeSilk>(
// 	event: RecordingEventSilk,
// 	type: FieldType,
// ): event is PlayerDataEventSilk<Extract<PlayerDataFieldNameSilk, >> {
// 	const field =
// 	return event instanceof PlayerDataEventSilk && event.field.type === type;
// }
