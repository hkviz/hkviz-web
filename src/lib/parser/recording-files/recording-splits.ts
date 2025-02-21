import { enemiesJournalLang } from '../../hk-data';
import { virtualCharms } from '../charms';
import { abilitiesAndItems } from '../player-data/abilities';
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
	playerDataFields,
} from '../player-data/player-data';
import { assertNever, parseHtmlEntities } from '../util';
import { FrameEndEvent, PlayerDataEvent } from './events';
import { type PlayerPositionEvent } from './events/player-position-event';
import { RecordingEvent } from './recording';

export const recordingSplitGroups = [
	{
		name: 'dreamer',
		displayName: 'Dreamers',
		description: 'Broken Dreamer seals',
		defaultShown: true,
	},
	{
		name: 'boss',
		displayName: 'Bosses defeats',
		description: 'Defeated bosses. Not including bosses which are fought again in Godhome.',
		defaultShown: true,
	},
	{
		name: 'abilities',
		displayName: 'Abilities',
		description: 'Obtained abilities. (E.g. spells)',
		defaultShown: true,
	},
	{
		name: 'items',
		displayName: 'Items',
		description: 'Collected items (e.g. the map or delicate flower). Not including charm collections and relicts.',
		defaultShown: true,
	},
	{
		name: 'charmCollection',
		displayName: 'Charm pick ups',
		description: 'Collected charms and charm upgrades',
		defaultShown: true,
	},
] as const;

export const recordingSplitGroupsByName = Object.fromEntries(
	recordingSplitGroups.map((group) => [group.name, group]),
) as Record<(typeof recordingSplitGroups)[number]['name'], (typeof recordingSplitGroups)[number]>;

export type RecordingSplitGroup = (typeof recordingSplitGroups)[number];
export type RecordingSplitGroupName = RecordingSplitGroup['name'];

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
	const nameConvo = enemyInfo?.nameConvo;
	const name = nameConvo ? enemiesJournalLang[nameConvo] : undefined;
	const enemyNameDisplay = overrideName ?? (nameConvo && name ? (parseHtmlEntities(name) ?? enemyName) : enemyName);
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

export function createRecordingSplits(events: RecordingEvent[]): RecordingSplit[] {
	const splits: RecordingSplit[] = [];

	for (const event of events) {
		if (event instanceof PlayerDataEvent) {
			if (event.isOfDefeatedField()) {
				const enemyDefeatName = getEnemyNameFromDefeatedField(event.field);
				const defeatMapping = playerDataNameToDefeatedName[enemyDefeatName];
				if (!(event.value && !event.previousPlayerDataEventOfField?.value)) {
					continue;
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
			} else if (event.isOfKilledField()) {
				const enemyName = getEnemyNameFromKilledField(event.field);
				const enemyInfo = enemies.byPlayerDataName[enemyName];
				if (enemyInfo && isEnemyBoss(enemyInfo)) {
					if (event.value && !event.previousPlayerDataEventOfField?.value) {
						const split = createRecordingSplitFromEnemy(
							event.msIntoGame,
							enemyName,
							enemyInfo,
							event.previousPlayerPositionEvent,
						);
						splits.push(split);
						console.log('kill split', split);
					}
				}
			} else if (event.isOfField(playerDataFields.byFieldName.killsMegaBeamMiner)) {
				// The Crystal Guardian has a special case
				// its second form does not have a separate killed field, nor defeated field (afaik)
				// so we need to check the kills field, which at first is 2 and is decreased with each kill
				// since the killed field handles the first version, only the second version is interesting

				const previous = event.previousPlayerDataEventOfField;
				if (event.value === 0 && (!previous || previous.value > 0)) {
					// the value is 0, so the second form is defeated
					const enemyInfo = enemies.byPlayerDataName.MegaBeamMiner;
					splits.push(
						createRecordingSplitFromEnemy(
							event.msIntoGame,
							'Enraged Guardian',
							enemyInfo,
							event.previousPlayerPositionEvent,
							'Enraged Guardian',
						),
					);
				}
			} else if (event.isOfField(playerDataFields.byFieldName.greyPrinceDefeats)) {
				const enemyInfo = enemies.byPlayerDataName.GreyPrince;
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
			} else if (event.isOfAbilityOrItemField()) {
				const abilityOrItem = abilitiesAndItems[event.field.name];
				if (!abilityOrItem) continue;
				const boolCondition =
					isPlayerDataBoolField(event.field) && event.value && !event.previousPlayerDataEventOfField?.value;
				const intCondition: boolean =
					event.field.type === 'Int32' &&
					(event.value as any as number) > 0 &&
					event.previousPlayerDataEventOfField != null &&
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
			} else if (event.isOfField(playerDataFields.byFieldName.charmSlots)) {
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
			} else if (event.isOfField(playerDataFields.byFieldName.hasDreamNail)) {
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
			} else if (event.isOfField(playerDataFields.byFieldName.hasDreamGate)) {
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
			} else if (event.isOfField(playerDataFields.byFieldName.dreamNailUpgraded)) {
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
			} else if (event.isOfField(playerDataFields.byFieldName.nailSmithUpgrades)) {
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
			} else if (event.isOfField(playerDataFields.byFieldName.heartPieces)) {
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
			} else if (event.isOfField(playerDataFields.byFieldName.vesselFragments)) {
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
				].forEach((map) => {
					if (event.isOfField(map.field)) {
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
					}
				});
			}
		} else if (event instanceof FrameEndEvent) {
			// ----- CHARMS -----
			for (const virtualCharm of virtualCharms) {
				if (
					virtualCharm.hasCharm(event) &&
					(!event.previousFrameEndEvent || !virtualCharm.hasCharm(event.previousFrameEndEvent))
				) {
					splits.push({
						msIntoGame: event.msIntoGame,
						title: `${virtualCharm.name}`,
						tooltip: `Got ${virtualCharm.name}`,
						imageUrl: `/ingame-sprites/charms/${virtualCharm.spriteName}.png`,
						group: recordingSplitGroupsByName.charmCollection,
						debugInfo: undefined,
						previousPlayerPositionEvent: event.previousPlayerPositionEvent,
					});
				}
			}

			// ----- FLOWER -----
			{
				const previousEvent = event.previousFrameEndEvent;
				const hadBrokenFlowerLastFrame = previousEvent?.xunFlowerBroken ?? false;
				const hadFlowerLastFrame = (previousEvent?.hasXunFlower ?? false) && !hadBrokenFlowerLastFrame;

				const hasBrokenFlowerThisFrame = event.xunFlowerBroken;
				const hasFlowerThisFrame = event.hasXunFlower && !hasBrokenFlowerThisFrame;

				if (!hadFlowerLastFrame && hasFlowerThisFrame) {
					splits.push({
						msIntoGame: event.msIntoGame,
						title: 'Delicate Flower',
						tooltip: 'Got Delicate Flower',
						imageUrl: '/ingame-sprites/inventory/White_Flower_Full.png',
						group: recordingSplitGroupsByName.items,
						debugInfo: undefined,
						previousPlayerPositionEvent: event.previousPlayerPositionEvent,
					});
				}
				if (!hadBrokenFlowerLastFrame && hasBrokenFlowerThisFrame) {
					splits.push({
						msIntoGame: event.msIntoGame,
						title: 'Ruined Flower',
						tooltip: 'Broke Delicate Flower',
						imageUrl: '/ingame-sprites/inventory/White_Flower_Half.png',
						group: recordingSplitGroupsByName.items,
						debugInfo: undefined,
						previousPlayerPositionEvent: event.previousPlayerPositionEvent,
					});
				}
			}

			// ----- SPELL LEVELS -----
			// fireball
			if (event.fireballLevel === 1 && event.previousFrameEndEvent?.fireballLevel !== 1) {
				splits.push({
					msIntoGame: event.msIntoGame,
					title: 'Vengeful Spirit',
					tooltip: 'Got Vengeful Spirit',
					imageUrl: '/ingame-sprites/inventory/Inv_0025_spell_fireball_01.png',
					group: recordingSplitGroupsByName.abilities,
					debugInfo: undefined,
					previousPlayerPositionEvent: event.previousPlayerPositionEvent,
				});
			}
			if (event.fireballLevel === 2 && event.previousFrameEndEvent?.fireballLevel !== 2) {
				splits.push({
					msIntoGame: event.msIntoGame,
					title: 'Shade Soul',
					tooltip: 'Got Shade Soul (upgrade for Vengeful Spirit)',
					imageUrl: '/ingame-sprites/inventory/Inv_0025_spell_fireball_01_level2.png',
					group: recordingSplitGroupsByName.abilities,
					debugInfo: undefined,
					previousPlayerPositionEvent: event.previousPlayerPositionEvent,
				});
			}
			// up spell
			if (event.screamLevel === 1 && event.previousFrameEndEvent?.screamLevel !== 1) {
				splits.push({
					msIntoGame: event.msIntoGame,
					title: 'Howling Wraiths',
					tooltip: 'Got Howling Wraiths',
					imageUrl: '/ingame-sprites/inventory/Inv_0024_spell_scream_01.png',
					group: recordingSplitGroupsByName.abilities,
					debugInfo: undefined,
					previousPlayerPositionEvent: event.previousPlayerPositionEvent,
				});
			}
			if (event.screamLevel === 2 && event.previousFrameEndEvent?.screamLevel !== 2) {
				splits.push({
					msIntoGame: event.msIntoGame,
					title: 'Abyss Shriek',
					tooltip: 'Got Abyss Shriek (upgrade for Howling Wraiths)',
					imageUrl: '/ingame-sprites/inventory/Inv_0024_spell_scream_01_level2.png',
					group: recordingSplitGroupsByName.abilities,
					debugInfo: undefined,
					previousPlayerPositionEvent: event.previousPlayerPositionEvent,
				});
			}
			// down spell
			if (event.quakeLevel === 1 && event.previousFrameEndEvent?.quakeLevel !== 1) {
				splits.push({
					msIntoGame: event.msIntoGame,
					title: 'Desolate Dive',
					tooltip: 'Got Howling Wraiths',
					imageUrl: '/ingame-sprites/inventory/Inv_0026_spell_quake_01.png',
					group: recordingSplitGroupsByName.abilities,
					debugInfo: undefined,
					previousPlayerPositionEvent: event.previousPlayerPositionEvent,
				});
			}
			if (event.quakeLevel === 2 && event.previousFrameEndEvent?.quakeLevel !== 2) {
				splits.push({
					msIntoGame: event.msIntoGame,
					title: 'Descending Dark',
					tooltip: 'Got Descending Dark (upgrade for Desolate Dive)',
					imageUrl: '/ingame-sprites/inventory/Inv_0026_spell_quake_01_level2.png',
					group: recordingSplitGroupsByName.abilities,
					debugInfo: undefined,
					previousPlayerPositionEvent: event.previousPlayerPositionEvent,
				});
			}
		}
	}

	return splits; //.sort((a, b) => a.msIntoGame - b.msIntoGame);
}
