import { PlayerDataEventSilk } from '~/lib/parser/recording-files/events-silk/player-data-event-silk';
import { PlayerDataFieldNameSilk, PlayerDataFieldSilk, PlayerDataFieldTypeSilk } from './player-data-silk.generated';

export { playerDataFieldsSilk } from './player-data-silk.generated';

export function isPlayerDataEventOfFieldSilk<TFieldName extends PlayerDataFieldNameSilk>(
	event: unknown,
	fieldName: TFieldName,
): event is PlayerDataEventSilk<TFieldName> {
	return event instanceof PlayerDataEventSilk && event.fieldName === fieldName;
}

export const playerDataTypesNamedMapsSilk = [
	'dictionary<string,bool>',
	'dictionary<string,int>',
	'CollectableItemsData',
	'CollectableRelicsData',
	'CollectableMementosData',
	'QuestRumourData',
	'QuestCompletionData',
	'MateriumItemsData',
	'ToolItemLiquidsData',
	'ToolItemsData',
	'ToolCrestsData',
	'EnemyJournalKillData',
	'FloatingCrestSlotsData',
] as const satisfies readonly PlayerDataFieldTypeSilk[];

export type PlayerDataFieldTypeNamedMapSilk = (typeof playerDataTypesNamedMapsSilk)[number];
export type PlayerDataFieldNameNamedMapSilk = (PlayerDataFieldSilk & { type: PlayerDataFieldTypeNamedMapSilk })['name'];

// export function isPlayerDataEventWithFieldTypeSilk<FieldType extends PlayerDataFieldTypeSilk>(
// 	event: RecordingEventSilk,
// 	type: FieldType,
// ): event is PlayerDataEventSilk<Extract<PlayerDataFieldNameSilk, >> {
// 	const field =
// 	return event instanceof PlayerDataEventSilk && event.field.type === type;
// }
