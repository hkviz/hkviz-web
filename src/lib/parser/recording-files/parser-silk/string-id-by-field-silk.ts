import { PlayerDataFieldNameNamedMapSilk } from '~/lib/game-data/silk-data/player-data-silk';
import {
	PlayerDataFieldNameOfTypeHashsetOfStringSilk,
	PlayerDataFieldNameOfTypeListOfStringSilk,
	PlayerDataFieldNameOfTypeStringSilk,
	PlayerDataFieldSilk,
} from '~/lib/game-data/silk-data/player-data-silk.generated';
import { sceneIdToSceneNameSilk } from '~/lib/game-data/silk-data/scene-ids-silk';
import { toolCrestIdToNameSilk } from '~/lib/game-data/silk-data/tool-crest-silk.generated';
import { toolItemIdToNameSilk } from '~/lib/game-data/silk-data/tool-item-silk.generated';

export const EMPTY_STRING_ID_LOOKUP = new Map<number, string>();

function setIdLookupDebugName(lookup: Map<number, string>, name: string): Map<number, string> {
	(lookup as any)._debugName = name;
	return lookup;
}

export function getIdLookupDebugName(lookup: Map<number, string>): string {
	return (lookup as any)._debugName ?? 'unknown';
}

export const stringIdMappingSilk = {
	empty: setIdLookupDebugName(EMPTY_STRING_ID_LOOKUP, 'EMPTY_STRING_ID_LOOKUP'),
	sceneName: setIdLookupDebugName(sceneIdToSceneNameSilk, 'sceneIdToSceneNameSilk'),
	crest: setIdLookupDebugName(toolCrestIdToNameSilk, 'toolCrestIdToNameSilk'),
	tool: setIdLookupDebugName(toolItemIdToNameSilk, 'toolItemIdToNameSilk'),
};

const stringIdToString: Record<
	| PlayerDataFieldNameOfTypeListOfStringSilk
	| PlayerDataFieldNameOfTypeHashsetOfStringSilk
	| PlayerDataFieldNameOfTypeStringSilk
	| PlayerDataFieldNameNamedMapSilk,
	Map<number, string>
> = {
	// list<string>
	BelltownCouriersGenericQuests: stringIdMappingSilk.empty,
	unlockedBossScenes: stringIdMappingSilk.empty,

	// hashset<string>
	scenesEncounteredBench: stringIdMappingSilk.sceneName,
	scenesEncounteredCocoon: stringIdMappingSilk.sceneName,
	scenesMapped: stringIdMappingSilk.sceneName,
	scenesVisited: stringIdMappingSilk.sceneName,

	// string
	CurrentCrestID: stringIdMappingSilk.crest,
	PreviousCrestID: stringIdMappingSilk.crest,

	// named maps
	Tools: stringIdMappingSilk.tool,
	ToolEquips: stringIdMappingSilk.crest,

	BelltownCouriersLastCompletedQuest: stringIdMappingSilk.empty,
	BelltownHousePlayingInfo_RelicName: stringIdMappingSilk.empty,
	CaravanSpiderTargetScene: stringIdMappingSilk.empty,
	CrowSummonsAppearedScene: stringIdMappingSilk.empty,
	HeroCorpseScene: stringIdMappingSilk.empty,
	LastSetFieldName: stringIdMappingSilk.empty,
	LibrarianPlayingInfo_RelicName: stringIdMappingSilk.empty,
	MazeEntranceDoor: stringIdMappingSilk.empty,
	MazeEntranceInitialDoor: stringIdMappingSilk.empty,
	MazeEntranceInitialScene: stringIdMappingSilk.empty,
	MazeEntranceScene: stringIdMappingSilk.empty,
	PreviousMazeDoor: stringIdMappingSilk.empty,
	PreviousMazeScene: stringIdMappingSilk.empty,
	PreviousMazeTargetDoor: stringIdMappingSilk.empty,
	bossReturnEntryGate: stringIdMappingSilk.empty,
	currentArea: stringIdMappingSilk.empty,
	currentBossStatueCompletionKey: stringIdMappingSilk.empty,
	date: stringIdMappingSilk.empty,
	dreamReturnScene: stringIdMappingSilk.empty,
	nextScene: stringIdMappingSilk.empty,
	nonLethalRespawnMarker: stringIdMappingSilk.empty,
	nonLethalRespawnScene: stringIdMappingSilk.empty,
	respawnMarkerName: stringIdMappingSilk.empty,
	respawnScene: stringIdMappingSilk.empty,
	tempRespawnMarker: stringIdMappingSilk.empty,
	tempRespawnScene: stringIdMappingSilk.empty,
	version: stringIdMappingSilk.empty,

	EnemyJournalKillData: stringIdMappingSilk.empty,
	QuestCompletionData: stringIdMappingSilk.empty,
	QuestRumourData: stringIdMappingSilk.empty,
	SteelQuestSpots: stringIdMappingSilk.empty,
	toolAmountsOverride: stringIdMappingSilk.empty,
	Collectables: stringIdMappingSilk.empty,
	MateriumCollected: stringIdMappingSilk.empty,
	MementosDeposited: stringIdMappingSilk.empty,
	Relics: stringIdMappingSilk.empty,
	ToolLiquids: stringIdMappingSilk.empty,
	ExtraToolEquips: stringIdMappingSilk.empty,
};

export function getStringIdToStringForField(field: PlayerDataFieldSilk): Map<number, string> {
	return stringIdToString[field.name as keyof typeof stringIdToString] ?? EMPTY_STRING_ID_LOOKUP;
}
