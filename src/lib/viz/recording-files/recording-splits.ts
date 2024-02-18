import { assertNever } from '~/lib/utils/utils';
import { enemiesJournalLang } from '../generated/enemies-journal-lang.generated';
import { enemies, isEnemyBoss, playerDataNameToDefeatedName, type EnemyInfo } from '../player-data/enemies';
import {
    getCharmIdFromGotCharmField,
    getEnemyNameFromDefeatedField,
    getEnemyNameFromKilledField,
    isPlayerDataDefeatedField,
    isPlayerDataGotCharmField,
    isPlayerDataKilledField,
    playerDataFields,
} from '../player-data/player-data';
import { type CombinedRecording } from './recording';

export const RecordingSplitGroups = [
    {
        name: 'boss',
        displayName: 'Bosses',
    },
    {
        name: 'dreamer',
        displayName: 'Dreamers',
    },
    {
        name: 'charmCollection',
        displayName: 'Charm pick ups',
    },
] as const;

export type RecordingSplitGroup = (typeof RecordingSplitGroups)[number]['name'];

export interface RecordingSplit {
    msIntoGame: number;
    title: string;
    tooltip: string;
    imageUrl: string | undefined;
    group: RecordingSplitGroup;
    debugInfo: unknown;
}

function createRecordingSplitFromEnemy(
    msIntoGame: number,
    enemyName: string,
    enemyInfo: EnemyInfo | undefined,
    overrideName?: string | undefined,
): RecordingSplit {
    const enemyNameDisplay =
        overrideName ?? (enemyInfo?.nameConvo ? enemiesJournalLang[enemyInfo.nameConvo] ?? enemyName : enemyName);
    return {
        msIntoGame,
        title: enemyNameDisplay, // + '(' + enemyInfo?.neededForJournal + ')',
        tooltip: `Defeated ${enemyNameDisplay}`,
        imageUrl: enemyInfo?.portraitName ? `/ingame-sprites/bestiary/${enemyInfo.portraitName}.png` : undefined,
        group: 'boss',
        debugInfo: enemyInfo,
    };
}

// export class DefeatedRecordingSplit extends RecordingSplitBase {
//     constructor(
//         msIntoGame: number,
//         public override title: string,
//         public override tooltip: string,
//     ) {
//         super(msIntoGame);
//     }

//     fromEnemy(msIntoGame: number, enemyName: string, field: PlayerDataDefeatedField, enemyInfo: EnemyInfo | undefined) {
//         const enemyNameDisplay = enemyInfo?.nameConvo ? enemiesJournalLang[enemyInfo.nameConvo] ?? enemyName : enemyName;
//         return new DefeatedRecordingSplit(msIntoGame, enemyName, 'Defeated ' + enemyName);

//         this.title = this.enemyDisplayName;
//         this.tooltip = `Defeated ${this.enemyDisplayName}`;
//         this.imageUrl = enemyInfo?.portraitName ? `/ingame-sprites/bestiary/${enemyInfo.portraitName}.png` : undefined;
//     }
// }

export function createRecordingSplits(recording: CombinedRecording): RecordingSplit[] {
    const splits: RecordingSplit[] = [];

    for (const field of Object.values(playerDataFields.byFieldName)) {
        if (isPlayerDataDefeatedField(field)) {
            const enemyDefeatName = getEnemyNameFromDefeatedField(field);
            const defeatMapping = playerDataNameToDefeatedName[enemyDefeatName];
            recording.allPlayerDataEventsOfField(field).forEach((event) => {
                if (!(event.value && !event.previousPlayerDataEventOfField?.value)) {
                    return;
                }

                if (defeatMapping === undefined) {
                    // ignore
                    // splits.push({
                    //     msIntoGame: event.msIntoGame,
                    //     title: event.field.name,
                    //     tooltip: 'Unknown',
                    //     imageUrl: undefined,
                    //     group: 'boss',
                    //     debugInfo: undefined,
                    // });
                } else if ('enemy' in defeatMapping) {
                    const enemyInfo = enemies.byPlayerDataName[defeatMapping.enemy];
                    splits.push(
                        createRecordingSplitFromEnemy(
                            event.msIntoGame,
                            enemyDefeatName,
                            enemyInfo,
                            defeatMapping.overrideName,
                        ),
                    );
                } else if ('dreamer' in defeatMapping) {
                    splits.push({
                        msIntoGame: event.msIntoGame,
                        title: defeatMapping.dreamer,
                        tooltip: defeatMapping.dreamer + "'s Seal broken",
                        imageUrl: `/ingame-sprites/achievement/${defeatMapping.achievementSprite}.png`,
                        group: 'dreamer',
                        debugInfo: defeatMapping,
                    });
                } else {
                    assertNever(defeatMapping);
                }
            });
        } else if (isPlayerDataKilledField(field)) {
            const enemyName = getEnemyNameFromKilledField(field);
            const enemyInfo = enemies.byPlayerDataName[enemyName];
            if (enemyInfo && isEnemyBoss(enemyInfo)) {
                recording.allPlayerDataEventsOfField(field).forEach((event) => {
                    if (event.value && !event.previousPlayerDataEventOfField?.value) {
                        splits.push(createRecordingSplitFromEnemy(event.msIntoGame, enemyName, enemyInfo));
                    }
                });
            }
        } else if (isPlayerDataGotCharmField(field)) {
            const charmId = getCharmIdFromGotCharmField(field);
            recording.allPlayerDataEventsOfField(field).forEach((event) => {
                if (event.value && !event.previousPlayerDataEventOfField?.value) {
                    splits.push({
                        msIntoGame: event.msIntoGame,
                        title: `Got Charm ${charmId}`,
                        tooltip: `Got charm ${charmId}`,
                        imageUrl: undefined,
                        group: 'charmCollection',
                        debugInfo: undefined,
                    });
                }
            });
        }
    }

    return splits.sort((a, b) => a.msIntoGame - b.msIntoGame);
}
