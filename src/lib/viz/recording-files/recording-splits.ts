import { tailwindChartColors } from '~/app/run/[id]/_extra-charts/colors';
import { assertNever } from '~/lib/utils/utils';
import { virtualCharms } from '../charms';
import { enemiesJournalLang } from '../generated/lang-enemies-journal.generated';
import {
    enemies,
    greyPrinceNames,
    isEnemyBoss,
    playerDataNameToDefeatedName,
    type EnemyInfo,
} from '../player-data/enemies';
import {
    getEnemyNameFromDefeatedField,
    getEnemyNameFromKilledField,
    isPlayerDataDefeatedField,
    isPlayerDataKilledField,
    playerDataFields,
} from '../player-data/player-data';
import { type CombinedRecording } from './recording';

export const recordingSplitGroups = [
    {
        name: 'boss',
        displayName: 'Bosses',
        color: tailwindChartColors.rose,
        defaultShown: true,
    },
    {
        name: 'dreamer',
        displayName: 'Dreamers',
        color: tailwindChartColors.sky,
        defaultShown: true,
    },
    {
        name: 'charmCollection',
        displayName: 'Charm pick ups',
        color: tailwindChartColors.amberLight,
        defaultShown: false,
    },
] as const;

export const recordingSplitGroupsByName = Object.fromEntries(
    recordingSplitGroups.map((group) => [group.name, group]),
) as Record<(typeof recordingSplitGroups)[number]['name'], (typeof recordingSplitGroups)[number]>;

export type RecordingSplitGroup = (typeof recordingSplitGroups)[number];

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
        group: recordingSplitGroupsByName.boss,
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
                        group: recordingSplitGroupsByName.dreamer,
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
        } else if (field === playerDataFields.byFieldName.greyPrinceDefeats) {
            const enemyInfo = enemies.byPlayerDataName.GreyPrince;
            recording.allPlayerDataEventsOfField(field).forEach((event) => {
                if (event.value >= 1 && event.previousPlayerDataEventOfField?.value !== event.value) {
                    const enemyName =
                        greyPrinceNames.at(event.value >= greyPrinceNames.length ? -1 : event.value - 1) ??
                        greyPrinceNames[0]!;
                    splits.push(createRecordingSplitFromEnemy(event.msIntoGame, enemyName, enemyInfo, enemyName));
                }
            });
        }
    }

    for (const virtualCharm of virtualCharms) {
        for (const frameEndEvent of recording.frameEndEvents) {
            if (
                virtualCharm.hasCharm(frameEndEvent) &&
                (!frameEndEvent.previousFrameEndEvent || !virtualCharm.hasCharm(frameEndEvent.previousFrameEndEvent))
            ) {
                splits.push({
                    msIntoGame: frameEndEvent.msIntoGame,
                    title: `${virtualCharm.name}`,
                    tooltip: `Got ${virtualCharm.name}`,
                    imageUrl: `/ingame-sprites/charms/${virtualCharm.spriteName}.png`,
                    group: recordingSplitGroupsByName.charmCollection,
                    debugInfo: undefined,
                });
            }
        }
    }

    return splits.sort((a, b) => a.msIntoGame - b.msIntoGame);
}
