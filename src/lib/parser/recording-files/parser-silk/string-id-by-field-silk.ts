import { collectableRelicIdToNameSilk } from '~/lib/game-data/silk-data/collectable-relic-silk.generated';
import { collectableIdToNameSilk } from '~/lib/game-data/silk-data/collectable-silk.generated';
import { enemyJournalIdToNameSilk } from '~/lib/game-data/silk-data/enemy-journal-silk.generated';
import { extraToolSlotIdToNameSilk } from '~/lib/game-data/silk-data/extra-tool-slot-silk.generated';
import { materiumIdToNameSilk } from '~/lib/game-data/silk-data/materium-silk.generated';
import { PlayerDataFieldNameNamedMapSilk } from '~/lib/game-data/silk-data/player-data-silk';
import {
	PlayerDataFieldNameOfTypeHashsetOfStringSilk,
	PlayerDataFieldNameOfTypeListOfStringSilk,
	PlayerDataFieldNameOfTypeStringSilk,
	PlayerDataFieldSilk,
	playerDataFieldsSilk,
} from '~/lib/game-data/silk-data/player-data-silk.generated';
import { questIdToNameSilk } from '~/lib/game-data/silk-data/quest-silk.generated';
import { respawnPointIdToNameSilk } from '~/lib/game-data/silk-data/respawn-point-silk.generated';
import { sceneIdToSceneNameSilk } from '~/lib/game-data/silk-data/scene-ids-silk';
import { silksongVersionIdToNameSilk } from '~/lib/game-data/silk-data/silksong-version-silk.generated';
import { toolCrestIdToNameSilk } from '~/lib/game-data/silk-data/tool-crest-silk.generated';
import { toolItemIdToNameSilk } from '~/lib/game-data/silk-data/tool-item-silk.generated';
import { toolLiquidIdToNameSilk } from '~/lib/game-data/silk-data/tool-liquid-silk.generated';
import { transitionGateIdToNameSilk } from '~/lib/game-data/silk-data/transition-gate-silk.generated';

export const EMPTY_STRING_ID_LOOKUP = new Map<number, string>();

function setIdLookupDebugName(lookup: Map<number, string>, name: string): Map<number, string> {
	(lookup as any)._debugName = name;
	return lookup;
}

export function getIdLookupDebugName(lookup: Map<number, string>): string {
	return (lookup as any)._debugName ?? 'unknown';
}

export const stringIdMappingSilk = {
	non: setIdLookupDebugName(EMPTY_STRING_ID_LOOKUP, 'EMPTY_STRING_ID_LOOKUP'),
	sceneName: setIdLookupDebugName(sceneIdToSceneNameSilk, 'sceneIdToSceneNameSilk'),
	crest: setIdLookupDebugName(toolCrestIdToNameSilk, 'toolCrestIdToNameSilk'),
	tool: setIdLookupDebugName(toolItemIdToNameSilk, 'toolItemIdToNameSilk'),
	collectable: setIdLookupDebugName(collectableIdToNameSilk, 'collectableIdToNameSilk'),
	relic: setIdLookupDebugName(collectableRelicIdToNameSilk, 'relicIdToNameSilk'),
	enemy: setIdLookupDebugName(enemyJournalIdToNameSilk, 'enemyJournalIdToNameSilk'),
	quest: setIdLookupDebugName(questIdToNameSilk, 'questIdToNameSilk'),
	materium: setIdLookupDebugName(materiumIdToNameSilk, 'materiumIdToNameSilk'),
	transitionGate: setIdLookupDebugName(transitionGateIdToNameSilk, 'transitionGateIdToNameSilk'),
	respawnPoint: setIdLookupDebugName(respawnPointIdToNameSilk, 'respawnPointIdToNameSilk'),
	playerDataField: setIdLookupDebugName(
		new Map(playerDataFieldsSilk.byId.entries().map(([id, field]) => [id, field.name] as const)),
		'playerDataFieldIdToNameSilk',
	),
	extraToolSlot: setIdLookupDebugName(extraToolSlotIdToNameSilk, 'extraToolSlotIdToNameSilk'),
	liquid: setIdLookupDebugName(toolLiquidIdToNameSilk, 'toolLiquidIdToNameSilk'),
	version: setIdLookupDebugName(silksongVersionIdToNameSilk, 'silksongVersionIdToNameSilk'),
};

const stringIdToString: Record<
	| PlayerDataFieldNameOfTypeListOfStringSilk
	| PlayerDataFieldNameOfTypeHashsetOfStringSilk
	| PlayerDataFieldNameOfTypeStringSilk
	| PlayerDataFieldNameNamedMapSilk,
	Map<number, string>
> = {
	// list<string>
	BelltownCouriersGenericQuests: stringIdMappingSilk.non,
	unlockedBossScenes: stringIdMappingSilk.non,

	// hashset<string>
	scenesEncounteredBench: stringIdMappingSilk.sceneName,
	scenesEncounteredCocoon: stringIdMappingSilk.sceneName,
	scenesMapped: stringIdMappingSilk.sceneName,
	scenesVisited: stringIdMappingSilk.sceneName,

	// string
	CurrentCrestID: stringIdMappingSilk.crest,
	PreviousCrestID: stringIdMappingSilk.crest,
	respawnScene: stringIdMappingSilk.sceneName,
	tempRespawnScene: stringIdMappingSilk.sceneName,
	HeroCorpseScene: stringIdMappingSilk.sceneName,
	nonLethalRespawnScene: stringIdMappingSilk.sceneName,
	MazeEntranceInitialScene: stringIdMappingSilk.sceneName,
	MazeEntranceScene: stringIdMappingSilk.sceneName,
	CaravanSpiderTargetScene: stringIdMappingSilk.sceneName,
	CrowSummonsAppearedScene: stringIdMappingSilk.sceneName,
	PreviousMazeScene: stringIdMappingSilk.sceneName,
	dreamReturnScene: stringIdMappingSilk.sceneName,
	nextScene: stringIdMappingSilk.sceneName,
	BelltownHousePlayingInfo_RelicName: stringIdMappingSilk.relic,
	LibrarianPlayingInfo_RelicName: stringIdMappingSilk.relic,
	MazeEntranceDoor: stringIdMappingSilk.transitionGate,
	PreviousMazeDoor: stringIdMappingSilk.transitionGate,
	MazeEntranceInitialDoor: stringIdMappingSilk.transitionGate,
	bossReturnEntryGate: stringIdMappingSilk.transitionGate, // ?
	respawnMarkerName: stringIdMappingSilk.respawnPoint,
	nonLethalRespawnMarker: stringIdMappingSilk.respawnPoint,
	tempRespawnMarker: stringIdMappingSilk.respawnPoint,
	LastSetFieldName: stringIdMappingSilk.playerDataField,
	version: stringIdMappingSilk.version,

	// named maps
	Tools: stringIdMappingSilk.tool,
	ToolEquips: stringIdMappingSilk.crest,
	SteelQuestSpots: stringIdMappingSilk.sceneName,
	Relics: stringIdMappingSilk.relic,
	Collectables: stringIdMappingSilk.collectable,
	EnemyJournalKillData: stringIdMappingSilk.enemy,
	QuestCompletionData: stringIdMappingSilk.quest,
	MateriumCollected: stringIdMappingSilk.materium,
	MementosDeposited: stringIdMappingSilk.collectable,
	ExtraToolEquips: stringIdMappingSilk.extraToolSlot,
	ToolLiquids: stringIdMappingSilk.liquid,

	BelltownCouriersLastCompletedQuest: stringIdMappingSilk.non,
	PreviousMazeTargetDoor: stringIdMappingSilk.non,
	currentArea: stringIdMappingSilk.non,
	currentBossStatueCompletionKey: stringIdMappingSilk.non,
	date: stringIdMappingSilk.non,

	QuestRumourData: stringIdMappingSilk.non,
	toolAmountsOverride: stringIdMappingSilk.non,
};

export function getStringIdToStringForField(field: PlayerDataFieldSilk): Map<number, string> {
	return stringIdToString[field.name as keyof typeof stringIdToString] ?? EMPTY_STRING_ID_LOOKUP;
}
