import { PlayerDataEventSilk } from '~/lib/parser/recording-files/events-silk/player-data-event-silk';
import {
	PlayerDataFieldNameSilk,
	PlayerDataFieldSilk,
	PlayerDataFieldTypeSilk,
	SaveSlotCompletionIcons_CompletionStateSilk,
} from './player-data-silk.generated';

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

const endingToSprite: Record<SaveSlotCompletionIcons_CompletionStateSilk, string> = {
	None: '',
	Act2Regular: 'completion__0002_Act2_regular',
	Act2Cursed: 'completion__0003_Act2_cursed',
	Act2SoulSnare: 'completion__0001_Act2_soulsnare',
	Act3Ending: 'completion__0000_Act3_ending',
};

export function completionSpriteSilk(completionState: SaveSlotCompletionIcons_CompletionStateSilk) {
	return '/silk-sprites/endings/' + endingToSprite[completionState] + '.png';
}

// todo localize?
const endingToName: Record<SaveSlotCompletionIcons_CompletionStateSilk, string> = {
	None: 'None',
	Act2Regular: 'Weaver Queen',
	Act2Cursed: 'Twisted Child',
	Act2SoulSnare: 'Snared Silk',
	Act3Ending: 'Sister of the Void',
};
export function completionNameSilk(completionState: SaveSlotCompletionIcons_CompletionStateSilk) {
	return endingToName[completionState];
}

const endingToSubtitle: Record<SaveSlotCompletionIcons_CompletionStateSilk, string> = {
	None: '',
	Act2Regular: 'Ending 1',
	Act2Cursed: 'Ending 3',
	Act2SoulSnare: 'Ending 2',
	Act3Ending: 'Ending 4',
};

export function completionSubtitleSilk(completionState: SaveSlotCompletionIcons_CompletionStateSilk) {
	return endingToSubtitle[completionState];
}
