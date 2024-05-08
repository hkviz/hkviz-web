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
    getDefaultValue,
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
        displayName: 'Bosses defeats',
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
        } else if (field === playerDataFields.byFieldName.charmSlots) {
            recording.allPlayerDataEventsOfField(field).forEach((event) => {
                if (
                    event.value > getDefaultValue(playerDataFields.byFieldName.charmSlots) &&
                    event.previousPlayerDataEventOfField?.value !== event.value
                ) {
                    splits.push({
                        msIntoGame: event.msIntoGame,
                        title: `Charm Notch (nr ${event.value})`,
                        tooltip: `Got ${event.value} Charm Notches`,
                        imageUrl: '/ingame-sprites/inventory/Inv_0027_spell_slot.png',
                        group: recordingSplitGroupsByName.charmCollection,
                        debugInfo: event,
                        previousPlayerPositionEvent: event.previousPlayerPositionEvent,
                    });
                }
            });
        } else if (field === playerDataFields.byFieldName.hasDreamNail) {
            recording.allPlayerDataEventsOfField(field).forEach((event) => {
                if (event.value && !event.previousPlayerDataEventOfField?.value) {
                    splits.push({
                        msIntoGame: event.msIntoGame,
                        title: 'Dream Nail',
                        tooltip: 'Got the Dream Nail',
                        imageUrl: '/ingame-sprites/inventory/dream_nail_0003_1.png',
                        group: recordingSplitGroupsByName.abilities,
                        debugInfo: event,
                        previousPlayerPositionEvent: event.previousPlayerPositionEvent,
                    });
                }
            });
        } else if (field === playerDataFields.byFieldName.hasDreamGate) {
            recording.allPlayerDataEventsOfField(field).forEach((event) => {
                if (event.value && !event.previousPlayerDataEventOfField?.value) {
                    splits.push({
                        msIntoGame: event.msIntoGame,
                        title: 'Dream Gate',
                        tooltip: 'Got the Dream Gate',
                        imageUrl: '/ingame-sprites/inventory/dream_gate_inv_icon.png',
                        group: recordingSplitGroupsByName.abilities,
                        debugInfo: event,
                        previousPlayerPositionEvent: event.previousPlayerPositionEvent,
                    });
                }
            });
        } else if (field === playerDataFields.byFieldName.dreamNailUpgraded) {
            recording.allPlayerDataEventsOfField(field).forEach((event) => {
                if (event.value && !event.previousPlayerDataEventOfField?.value) {
                    splits.push({
                        msIntoGame: event.msIntoGame,
                        title: 'Awoken Dream Nail',
                        tooltip: 'Awoke the the Dream Nail',
                        imageUrl: '/ingame-sprites/inventory/dream_nail_0000_4.png',
                        group: recordingSplitGroupsByName.abilities,
                        debugInfo: event,
                        previousPlayerPositionEvent: event.previousPlayerPositionEvent,
                    });
                }
            });
        } else if (field === playerDataFields.byFieldName.nailSmithUpgrades) {
            recording.allPlayerDataEventsOfField(field).forEach((event) => {
                if (event.value === 1 && event.previousPlayerDataEventOfField?.value !== 1) {
                    splits.push({
                        msIntoGame: event.msIntoGame,
                        title: `Sharpened Nail`,
                        tooltip: `Upgraded Nail first time`,
                        imageUrl: '/ingame-sprites/inventory/nail_upgrade_0002_sharpened_nail.png',
                        group: recordingSplitGroupsByName.items,
                        debugInfo: event,
                        previousPlayerPositionEvent: event.previousPlayerPositionEvent,
                    });
                } else if (event.value === 2 && event.previousPlayerDataEventOfField?.value !== 2) {
                    splits.push({
                        msIntoGame: event.msIntoGame,
                        title: `Channelled Nail`,
                        tooltip: `Upgraded Nail second time`,
                        imageUrl: '/ingame-sprites/inventory/nail_upgrade_0002_channel-nail.png',
                        group: recordingSplitGroupsByName.items,
                        debugInfo: event,
                        previousPlayerPositionEvent: event.previousPlayerPositionEvent,
                    });
                } else if (event.value === 3 && event.previousPlayerDataEventOfField?.value !== 3) {
                    splits.push({
                        msIntoGame: event.msIntoGame,
                        title: `Coiled Nail`,
                        tooltip: `Upgraded Nail third time`,
                        imageUrl: '/ingame-sprites/inventory/nail_upgrade_03_coil_nail.png',
                        group: recordingSplitGroupsByName.items,
                        debugInfo: event,
                        previousPlayerPositionEvent: event.previousPlayerPositionEvent,
                    });
                } else if (event.value === 4 && event.previousPlayerDataEventOfField?.value !== 4) {
                    splits.push({
                        msIntoGame: event.msIntoGame,
                        title: `Pure Nail`,
                        tooltip: `Upgraded Nail forth time`,
                        imageUrl: '/ingame-sprites/inventory/nail_upgrade_0000_pure-nail.png',
                        group: recordingSplitGroupsByName.items,
                        debugInfo: event,
                        previousPlayerPositionEvent: event.previousPlayerPositionEvent,
                    });
                }
            });
        } else if (field === playerDataFields.byFieldName.heartPieces) {
            recording.allPlayerDataEventsOfField(field).forEach((event) => {
                if (
                    event.value > 0 &&
                    event.previousPlayerDataEventOfField &&
                    event.value != event.previousPlayerDataEventOfField.value
                ) {
                    // 0 filtered out, since the game sets the masks to 1,2,3 and once getting the 4th mask
                    // the value will quickly change to 4 and then set to 0 (if not the last mask shard).

                    let image: string;

                    switch (event.value) {
                        case 1:
                            image = 'HP_UI_010007';
                            break;
                        case 2:
                            image = 'HP_UI_020007';
                            break;
                        case 3:
                            image = 'HP_UI_030007';
                            break;
                        case 4:
                            image = 'HP_UI_040004';
                            break;
                        default:
                            // should never happen in a unmodded game
                            image = 'HP_UI_010007';
                            break;
                    }

                    splits.push({
                        msIntoGame: event.msIntoGame,
                        title: `Mask Shard (${event.value}/4)`,
                        tooltip: `Got a Mask Shard (${event.value}/4)`,
                        imageUrl: `/ingame-sprites/inventory/${image}.png`,
                        group: recordingSplitGroupsByName.items,
                        debugInfo: event,
                        previousPlayerPositionEvent: event.previousPlayerPositionEvent,
                    });
                }
            });
        } else if (field === playerDataFields.byFieldName.vesselFragments) {
            recording.allPlayerDataEventsOfField(field).forEach((event) => {
                if (
                    event.value > 0 &&
                    event.previousPlayerDataEventOfField &&
                    event.value != event.previousPlayerDataEventOfField.value
                ) {
                    // 0 filtered out, since the game sets the masks to 1,2,3 and once getting the 4th mask
                    // the value will quickly change to 4 and then set to 0 (if not the last mask shard).

                    let image: string;

                    switch (event.value) {
                        case 1:
                            image = 'Inventory_soul_vessel_level_01';
                            break;
                        case 2:
                            image = 'Inventory_soul_vessel';
                            break;
                        case 3:
                            image = 'Inventory_soul_vessel_full';
                            break;
                        default:
                            // should never happen in a unmodded game
                            image = 'Inventory_soul_vessel_level_01';
                            break;
                    }

                    splits.push({
                        msIntoGame: event.msIntoGame,
                        title: `Vessel Fragment (${event.value}/3)`,
                        tooltip: `Got a Vessel Fragment (${event.value}/3)`,
                        imageUrl: `/ingame-sprites/inventory/${image}.png`,
                        group: recordingSplitGroupsByName.items,
                        debugInfo: event,
                        previousPlayerPositionEvent: event.previousPlayerPositionEvent,
                    });
                }
            });
        } else {
            [
                { field: playerDataFields.byFieldName.mapAbyss, title: 'Abyss Map' },
                {
                    field: playerDataFields.byFieldName.mapCity,
                    title: 'City of Tears Map',
                },
                { field: playerDataFields.byFieldName.mapCliffs, title: 'Howling Cliffs Map' },
                {
                    field: playerDataFields.byFieldName.mapCrossroads,
                    title: 'Forgotten Crossroads Map',
                },
                { field: playerDataFields.byFieldName.mapDeepnest, title: 'Deepnest Map' },
                {
                    field: playerDataFields.byFieldName.mapFogCanyon,
                    title: 'Fog Canyon Map',
                },
                { field: playerDataFields.byFieldName.mapGreenpath, title: 'Greenpath Map' },
                {
                    field: playerDataFields.byFieldName.mapMines,
                    title: 'Crystal Peak Map',
                },
                { field: playerDataFields.byFieldName.mapOutskirts, title: "Kingdom's Edge Map" },
                {
                    field: playerDataFields.byFieldName.mapRestingGrounds,
                    title: 'Resting Grounds Map',
                },
                { field: playerDataFields.byFieldName.mapRoyalGardens, title: "Queen's Gardens Map" },

                {
                    field: playerDataFields.byFieldName.mapFungalWastes,
                    title: 'Fungal Wastes Map',
                },
                { field: playerDataFields.byFieldName.mapWaterways, title: 'Royal Waterways Map' },
            ].map((map) => {
                if (field === map.field) {
                    recording.allPlayerDataEventsOfField(field).forEach((event) => {
                        if (event.value && !event.previousPlayerDataEventOfField?.value) {
                            splits.push({
                                msIntoGame: event.msIntoGame,
                                title: map.title,
                                tooltip: 'Got ' + map.title,
                                imageUrl: '/ingame-sprites/inventory/inv_item__0008_jar_col_map.png',
                                group: recordingSplitGroupsByName.items,
                                debugInfo: event,
                                previousPlayerPositionEvent: event.previousPlayerPositionEvent,
                            });
                        }
                    });
                }
            });
        }
    }

    // ----- CHARMS -----
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

    // ----- FLOWER -----
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

    // Spell levels
    for (const frameEndEvent of recording.frameEndEvents) {
        // fireball
        if (frameEndEvent.fireballLevel === 1 && frameEndEvent.previousFrameEndEvent?.fireballLevel !== 1) {
            splits.push({
                msIntoGame: frameEndEvent.msIntoGame,
                title: 'Vengeful Spirit',
                tooltip: 'Got Vengeful Spirit',
                imageUrl: '/ingame-sprites/inventory/Inv_0025_spell_fireball_01.png',
                group: recordingSplitGroupsByName.abilities,
                debugInfo: undefined,
                previousPlayerPositionEvent: frameEndEvent.previousPlayerPositionEvent,
            });
        }
        if (frameEndEvent.fireballLevel === 2 && frameEndEvent.previousFrameEndEvent?.fireballLevel !== 2) {
            splits.push({
                msIntoGame: frameEndEvent.msIntoGame,
                title: 'Shade Soul',
                tooltip: 'Got Shade Soul (upgrade for Vengeful Spirit)',
                imageUrl: '/ingame-sprites/inventory/Inv_0025_spell_fireball_01_level2.png',
                group: recordingSplitGroupsByName.abilities,
                debugInfo: undefined,
                previousPlayerPositionEvent: frameEndEvent.previousPlayerPositionEvent,
            });
        }
        // up spell
        if (frameEndEvent.screamLevel === 1 && frameEndEvent.previousFrameEndEvent?.screamLevel !== 1) {
            splits.push({
                msIntoGame: frameEndEvent.msIntoGame,
                title: 'Howling Wraiths',
                tooltip: 'Got Howling Wraiths',
                imageUrl: '/ingame-sprites/inventory/Inv_0024_spell_scream_01.png',
                group: recordingSplitGroupsByName.abilities,
                debugInfo: undefined,
                previousPlayerPositionEvent: frameEndEvent.previousPlayerPositionEvent,
            });
        }
        if (frameEndEvent.screamLevel === 2 && frameEndEvent.previousFrameEndEvent?.screamLevel !== 2) {
            splits.push({
                msIntoGame: frameEndEvent.msIntoGame,
                title: 'Abyss Shriek',
                tooltip: 'Got Abyss Shriek (upgrade for Howling Wraiths)',
                imageUrl: '/ingame-sprites/inventory/Inv_0024_spell_scream_01_level2.png',
                group: recordingSplitGroupsByName.abilities,
                debugInfo: undefined,
                previousPlayerPositionEvent: frameEndEvent.previousPlayerPositionEvent,
            });
        }
        // down spell
        if (frameEndEvent.quakeLevel === 1 && frameEndEvent.previousFrameEndEvent?.quakeLevel !== 1) {
            splits.push({
                msIntoGame: frameEndEvent.msIntoGame,
                title: 'Desolate Dive',
                tooltip: 'Got Howling Wraiths',
                imageUrl: '/ingame-sprites/inventory/Inv_0026_spell_quake_01.png',
                group: recordingSplitGroupsByName.abilities,
                debugInfo: undefined,
                previousPlayerPositionEvent: frameEndEvent.previousPlayerPositionEvent,
            });
        }
        if (frameEndEvent.quakeLevel === 2 && frameEndEvent.previousFrameEndEvent?.quakeLevel !== 2) {
            splits.push({
                msIntoGame: frameEndEvent.msIntoGame,
                title: 'Descending Dark',
                tooltip: 'Got Descending Dark (upgrade for Desolate Dive)',
                imageUrl: '/ingame-sprites/inventory/Inv_0026_spell_quake_01_level2.png',
                group: recordingSplitGroupsByName.abilities,
                debugInfo: undefined,
                previousPlayerPositionEvent: frameEndEvent.previousPlayerPositionEvent,
            });
        }
    }

    return splits.sort((a, b) => a.msIntoGame - b.msIntoGame);
}
