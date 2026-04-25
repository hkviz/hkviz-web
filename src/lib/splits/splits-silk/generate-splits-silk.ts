import {
	CollectableRelicNameSilk,
	collectableRelicSilk,
} from '~/lib/game-data/silk-data/collectable-relic-silk.generated';
import { CollectableNameSilk, collectableSilk } from '~/lib/game-data/silk-data/collectable-silk.generated';
import { isBossEnemySilk } from '~/lib/game-data/silk-data/enemy-journal-silk';
import { EnemyJournalNameSilk, enemyJournalSilk } from '~/lib/game-data/silk-data/enemy-journal-silk.generated';
import {
	completionNameSilk,
	completionSpriteSilk,
	completionSubtitleSilk,
	isPlayerDataEventOfFieldSilk,
} from '~/lib/game-data/silk-data/player-data-silk';
import { SaveSlotCompletionIcons_CompletionStateSilk } from '~/lib/game-data/silk-data/player-data-silk.generated';
import { QuestNameSilk, questSilk } from '~/lib/game-data/silk-data/quest-silk.generated';
import { getToolCrestSubtitle } from '~/lib/game-data/silk-data/tool-crest-silk';
import { ToolCrestNameSilk, toolCrestSilk } from '~/lib/game-data/silk-data/tool-crest-silk.generated';
import { toolItemSubtitle } from '~/lib/game-data/silk-data/tool-item-silk';
import { ToolItemNameSilk, toolItemSilk } from '~/lib/game-data/silk-data/tool-item-silk.generated';
import { CombinedRecordingSilk } from '~/lib/parser/recording-files/parser-silk/recording-silk';
import { localized } from '~/lib/viz/store/localization-store';
import { Split } from '../splits-shared/split';
import { splitGroupsSilk } from './split-group-silk';

export function createRecordingSplitsSilk(recording: CombinedRecordingSilk): Split[] {
	const splits: Split[] = [];

	for (const event of recording.events) {
		if (isPlayerDataEventOfFieldSilk(event, 'EnemyJournalKillData')) {
			const data = event.value;
			const previousData = event.previousPlayerDataEventOfField?.value;

			for (const [enemy, enemyData] of data.entries()) {
				const previousEnemyData = previousData?.get(enemy);

				if (enemyData.Kills > (previousEnemyData?.Kills ?? 0)) {
					const enemyInfo = enemyJournalSilk.byName[enemy as EnemyJournalNameSilk];
					if (isBossEnemySilk(enemyInfo)) {
						splits.push({
							msIntoGame: event.msIntoGame,
							title: localized.silkAny(enemyInfo.displayName),
							tooltip: '',
							imageUrl: `/silk-sprites/enemy-journal/${enemyInfo.iconSprite.name}.png`,
							group: splitGroupsSilk.boss,
							debugInfo: event,
							previousPlayerPositionEvent: event.previousPlayerPositionEvent,
							imageStyle: 'rounded-border',
						});
					}
				}
			}
		} else if (isPlayerDataEventOfFieldSilk(event, 'QuestCompletionData')) {
			const data = event.value;
			const previousData = event.previousPlayerDataEventOfField?.value;

			for (const [quest, questData] of data.entries()) {
				const previousQuestData = previousData?.get(quest);

				if (questData.IsCompleted && !(previousQuestData?.IsCompleted ?? false)) {
					const questInfo = questSilk.byName[quest as QuestNameSilk];
					splits.push({
						msIntoGame: event.msIntoGame,
						title: localized.silkAny(questInfo.displayNameKey),
						subtitle: localized.silk('Quests.UI_TITLE_QUESTS_COMPLETE'),
						tooltip: '',
						imageUrl: `/silk-sprites/quest/${questInfo.typeIcons.icon.name}.png`,
						group: splitGroupsSilk.questCompletion,
						debugInfo: event,
						previousPlayerPositionEvent: event.previousPlayerPositionEvent,
					});
				} else if (questData.IsAccepted && !(previousQuestData?.IsAccepted ?? false)) {
					const questInfo = questSilk.byName[quest as QuestNameSilk];
					splits.push({
						msIntoGame: event.msIntoGame,
						title: localized.silkAny(questInfo.displayNameKey),
						subtitle: localized.silk('Quests.UI_PROMPT_ACCEPTED'),
						tooltip: '',
						imageUrl: `/silk-sprites/quest/${questInfo.typeIcons.icon.name}.png`,
						group: splitGroupsSilk.questStarts,
						debugInfo: event,
						previousPlayerPositionEvent: event.previousPlayerPositionEvent,
					});
				}
			}
		} else if (isPlayerDataEventOfFieldSilk(event, 'Collectables')) {
			const data = event.value;
			const previousData = event.previousPlayerDataEventOfField?.value;

			for (const [collectable, collectableData] of data.entries()) {
				const previousCollectableData = previousData?.get(collectable);

				const diff = collectableData.Amount - (previousCollectableData?.Amount ?? 0);
				if (diff !== 0) {
					const collectableInfo = collectableSilk.byName[collectable as CollectableNameSilk];
					const icon = collectableInfo.iconInventory?.name;
					splits.push({
						msIntoGame: event.msIntoGame,
						title: localized.silkAny(collectableInfo.displayNameKey),
						subtitle: localized.raw(
							(diff > 0 ? ` +${diff}` : ` ${diff}`) + '  |  total = ' + collectableData.Amount,
						),
						tooltip: '',
						imageUrl: icon ? `/silk-sprites/collectable/${icon}.png` : '',
						group: splitGroupsSilk.collectables,
						debugInfo: event,
						previousPlayerPositionEvent: event.previousPlayerPositionEvent,
					});
				}
			}
		} else if (isPlayerDataEventOfFieldSilk(event, 'Tools')) {
			const data = event.value;
			const previousData = event.previousPlayerDataEventOfField?.value;

			for (const [tool, toolData] of data.entries()) {
				const previousToolData = previousData?.get(tool);

				if (toolData.IsUnlocked && !(previousToolData?.IsUnlocked ?? false)) {
					const toolInfo = toolItemSilk.byName[tool as ToolItemNameSilk];
					const subtitle = toolItemSubtitle(tool as ToolItemNameSilk);
					splits.push({
						msIntoGame: event.msIntoGame,
						title: localized.silkAny(toolInfo.displayName),
						subtitle: subtitle,
						tooltip: '',
						imageUrl: `/silk-sprites/tool-item/${toolInfo.toolSprite.name}.png`,
						group: splitGroupsSilk.toolCollection,
						debugInfo: event,
						previousPlayerPositionEvent: event.previousPlayerPositionEvent,
					});
				}
			}
		} else if (isPlayerDataEventOfFieldSilk(event, 'ToolEquips')) {
			const data = event.value;
			const previousData = event.previousPlayerDataEventOfField?.value;

			for (const [crest, crestData] of data.entries()) {
				const previousCrestData = previousData?.get(crest);

				if (crestData.IsUnlocked && !(previousCrestData?.IsUnlocked ?? false)) {
					// todo add level for hunter
					const crestInfo = toolCrestSilk.byName[crest as ToolCrestNameSilk];
					const subtitle = getToolCrestSubtitle(crest as ToolCrestNameSilk);
					if (crestInfo !== toolCrestSilk.byName.Hunter) {
						// default crest -> no split
						splits.push({
							msIntoGame: event.msIntoGame,
							title: crestInfo.displayName
								? localized.silkAny(crestInfo.displayName)
								: localized.raw(crest),
							subtitle: subtitle ? localized.raw(subtitle) : undefined,
							tooltip: '',
							imageUrl: crestInfo.crestSprite
								? `/silk-sprites/tool-crest/${crestInfo.crestSprite.name}.png`
								: '',
							group: splitGroupsSilk.crestCollection,
							debugInfo: event,
							previousPlayerPositionEvent: event.previousPlayerPositionEvent,
						});
					}
				}
			}
		} else if (isPlayerDataEventOfFieldSilk(event, 'Relics')) {
			const data = event.value;
			const previousData = event.previousPlayerDataEventOfField?.value;

			for (const [relic, relicData] of data.entries()) {
				const previousRelicData = previousData?.get(relic);

				if (relicData.IsCollected && !(previousRelicData?.IsCollected ?? false)) {
					// todo add level for hunter
					const relicInfo = collectableRelicSilk.byName[relic as CollectableRelicNameSilk];
					const icon = relicInfo.relicTypeInventoryIcon?.name;
					splits.push({
						msIntoGame: event.msIntoGame,
						title: localized.silkAny(relicInfo.typeNameKey),
						tooltip: '', // add additional text to tooltip?
						imageUrl: icon ? `/silk-sprites/collectable-relic/${icon}.png` : '',
						group: splitGroupsSilk.relicCollection,
						debugInfo: event,
						previousPlayerPositionEvent: event.previousPlayerPositionEvent,
					});
				}
			}
		} else if (isPlayerDataEventOfFieldSilk(event, 'CompletedEndings')) {
			const data = event.value;
			const previousData = event.previousPlayerDataEventOfField?.value;

			for (const ending of SaveSlotCompletionIcons_CompletionStateSilk.nameList) {
				if (ending === 'None') {
					continue;
				}

				const hasActive = SaveSlotCompletionIcons_CompletionStateSilk.hasFlag(data, ending);
				const hadActive = previousData
					? SaveSlotCompletionIcons_CompletionStateSilk.hasFlag(previousData, ending)
					: false;

				if (hasActive && !hadActive) {
					splits.push({
						msIntoGame: event.msIntoGame,
						title: localized.raw(completionNameSilk(ending)), // todo define name somewhere
						subtitle: localized.raw(completionSubtitleSilk(ending)),
						tooltip: '',
						imageUrl: completionSpriteSilk(ending),
						group: splitGroupsSilk.ending,
						debugInfo: event,
						previousPlayerPositionEvent: event.previousPlayerPositionEvent,
					});
				}
			}
		}
	}

	return splits.sort((a, b) => a.msIntoGame - b.msIntoGame);
}
