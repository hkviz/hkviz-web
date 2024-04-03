import { tailwindChartColors } from '~/app/run/[id]/_extra-charts/colors';
import { parseHtmlEntities } from '~/lib/utils/html';
import { assertNever } from '~/lib/utils/utils';
import { virtualCharms } from '../charms';
import { enemiesJournalLang } from '../generated/lang/enemies-journal.generated';
import { abilitiesAndItems, isPlayerDataAbilityOrItemField } from '../player-data/abilities';
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
    isPlayerDataBoolField,
    isPlayerDataDefeatedField,
    isPlayerDataKilledField,
    playerDataFields,
} from '../player-data/player-data';
import { type PlayerPositionEvent } from './events/player-position-event';
import { type CombinedRecording } from './recording';

export const recordingSplitGroups = [
    {
        name: 'dreamer',
        displayName: 'Dreamers',
        description: 'Broken Dreamer seals',
        color: tailwindChartColors.sky,
        defaultShown: true,
    },
    {
        name: 'boss',
        displayName: 'Bosses',
        description: 'Defeated bosses. Not including bosses which are fought again in Godhome.',
        color: tailwindChartColors.rose,
        defaultShown: true,
    },
    {
        name: 'abilities',
        displayName: 'Abilities',
        description: 'Obtained abilities. (E.g. spells)',
        color: tailwindChartColors.green,
        defaultShown: true,
    },
    {
        name: 'items',
        displayName: 'Items',
        description: 'Collected items (e.g. the map or delicate flower). Not including charm collections and relicts.',
        color: tailwindChartColors.indigo,
        defaultShown: true,
    },
    {
        name: 'charmCollection',
        displayName: 'Charm pick ups',
        description: 'Collected charms and charm upgrades',
        color: tailwindChartColors.amberLight,
        defaultShown: true,
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
    previousPlayerPositionEvent: PlayerPositionEvent | null;
}

function createRecordingSplitFromEnemy(
    msIntoGame: number,
    enemyName: string,
    enemyInfo: EnemyInfo | undefined,
    previousPlayerPositionEvent: PlayerPositionEvent | null,
    overrideName?: string | undefined,
): RecordingSplit {
    const enemyNameDisplay =
        overrideName ??
        (enemyInfo?.nameConvo ? parseHtmlEntities(enemiesJournalLang[enemyInfo.nameConvo]) ?? enemyName : enemyName);
    return {
        msIntoGame,
        title: enemyNameDisplay, // + '(' + enemyInfo?.neededForJournal + ')',
        tooltip: `Defeated ${enemyNameDisplay}`,
        imageUrl: enemyInfo?.portraitName ? `/ingame-sprites/bestiary/${enemyInfo.portraitName}.png` : undefined,
        group: recordingSplitGroupsByName.boss,
        debugInfo: enemyInfo,
        previousPlayerPositionEvent,
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
                            event.previousPlayerPositionEvent,
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
                        previousPlayerPositionEvent: event.previousPlayerPositionEvent,
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
                        splits.push(
                            createRecordingSplitFromEnemy(
                                event.msIntoGame,
                                enemyName,
                                enemyInfo,
                                event.previousPlayerPositionEvent,
                            ),
                        );
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
                    splits.push(
                        createRecordingSplitFromEnemy(
                            event.msIntoGame,
                            enemyName,
                            enemyInfo,
                            event.previousPlayerPositionEvent,
                            enemyName,
                        ),
                    );
                }
            });
        } else if (isPlayerDataAbilityOrItemField(field)) {
            const abilityOrItem = abilitiesAndItems[field.name];
            if (!abilityOrItem) continue;
            recording.allPlayerDataEventsOfField(field).forEach((event) => {
                const boolCondition =
                    isPlayerDataBoolField(event.field) && event.value && !event.previousPlayerDataEventOfField?.value;
                const intCondition =
                    event.field.type === 'Int32' &&
                    (event.value as any as number) > 0 &&
                    event.previousPlayerDataEventOfField &&
                    event.previousPlayerDataEventOfField.value < event.value;

                if (boolCondition || intCondition) {
                    splits.push({
                        msIntoGame: event.msIntoGame,
                        title: abilityOrItem.name,
                        tooltip: `Got ${abilityOrItem.name}`,
                        imageUrl: `/ingame-sprites/inventory/${abilityOrItem.spriteName}.png`,
                        group:
                            abilityOrItem.type === 'item'
                                ? recordingSplitGroupsByName.items
                                : abilityOrItem.type === 'ability'
                                  ? recordingSplitGroupsByName.abilities
                                  : assertNever(abilityOrItem.type),
                        debugInfo: event,
                        previousPlayerPositionEvent: event.previousPlayerPositionEvent,
                    });
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
                    previousPlayerPositionEvent: frameEndEvent.previousPlayerPositionEvent,
                });
            }
        }
    }

    let hadFlowerLastFrame = false;
    let hadBrokenFlowerLastFrame = false;
    for (const frameEndEvent of recording.frameEndEvents) {
        const xunFlowerBrokenThisFrame = frameEndEvent.xunFlowerBroken;
        const hasFlowerThisFrame = frameEndEvent.hasXunFlower && !xunFlowerBrokenThisFrame;

        if (!hadFlowerLastFrame && hasFlowerThisFrame) {
            splits.push({
                msIntoGame: frameEndEvent.msIntoGame,
                title: 'Delicate Flower',
                tooltip: 'Got Delicate Flower',
                imageUrl: '/ingame-sprites/inventory/White_Flower_Full.png',
                group: recordingSplitGroupsByName.items,
                debugInfo: undefined,
                previousPlayerPositionEvent: frameEndEvent.previousPlayerPositionEvent,
            });
        }
        if (!hadBrokenFlowerLastFrame && xunFlowerBrokenThisFrame) {
            splits.push({
                msIntoGame: frameEndEvent.msIntoGame,
                title: 'Ruined Flower',
                tooltip: 'Broke Delicate Flower',
                imageUrl: '/ingame-sprites/inventory/White_Flower_Half.png',
                group: recordingSplitGroupsByName.items,
                debugInfo: undefined,
                previousPlayerPositionEvent: frameEndEvent.previousPlayerPositionEvent,
            });
        }
        hadFlowerLastFrame = hasFlowerThisFrame;
        hadBrokenFlowerLastFrame = xunFlowerBrokenThisFrame;
    }

    return splits.sort((a, b) => a.msIntoGame - b.msIntoGame);
}
