import { localized } from '~/lib/viz/store/localization-store';
import { enemiesJournalLang } from '../../game-data/hollow-data';
import {
	getDefaultValue,
	getEnemyNameFromDefeatedField,
	getEnemyNameFromKilledField,
	isPlayerDataBoolField,
	isPlayerDataDefeatedField,
	isPlayerDataKilledField,
	playerDataFieldsHollow,
} from '../../game-data/hollow-data/player-data-hollow';
import { virtualCharms } from '../../parser/charms';
import { abilitiesAndItems, isPlayerDataAbilityOrItemField } from '../../parser/player-data/abilities';
import {
	enemies,
	greyPrinceNames,
	isEnemyBoss,
	playerDataNameToDefeatedName,
	type EnemyInfo,
} from '../../parser/player-data/enemies';
import { type PlayerPositionEvent } from '../../parser/recording-files/events-shared/player-position-event';
import { CombinedRecordingHollow } from '../../parser/recording-files/parser-hollow/recording-hollow';
import { assertNever, parseHtmlEntities } from '../../util';
import { Split } from '../splits-shared/split';
import { splitGroupsHollow } from './split-group-hollow';

function createRecordingSplitFromEnemy(
	msIntoGame: number,
	enemyName: string,
	enemyInfo: EnemyInfo | undefined,
	previousPlayerPositionEvent: PlayerPositionEvent | null,
	overrideName?: string,
): Split {
	const nameConvo = enemyInfo?.nameConvo;
	const name = nameConvo ? enemiesJournalLang[nameConvo] : undefined;
	const enemyNameDisplay = overrideName ?? (nameConvo && name ? (parseHtmlEntities(name) ?? enemyName) : enemyName);
	return {
		msIntoGame,
		title: localized.raw(enemyNameDisplay), // + '(' + enemyInfo?.neededForJournal + ')',
		tooltip: localized.raw(`Defeated ${enemyNameDisplay}`),
		imageUrl: enemyInfo?.portraitName ? `/ingame-sprites/bestiary/${enemyInfo.portraitName}.png` : undefined,
		group: splitGroupsHollow.boss,
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

export function createRecordingSplitsHollow(recording: CombinedRecordingHollow): Split[] {
	const splits: Split[] = [];

	for (const field of Object.values(playerDataFieldsHollow.byFieldName)) {
		if (isPlayerDataDefeatedField(field)) {
			const enemyDefeatName = getEnemyNameFromDefeatedField(field);
			const defeatMapping = playerDataNameToDefeatedName[enemyDefeatName];
			recording.allPlayerDataEventsOfField(field).forEach((event) => {
				if (!(event.value && !event.previousPlayerDataEventOfField?.value)) {
					return;
				}

				if (defeatMapping == null) {
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
						title: localized.raw(defeatMapping.dreamer),
						tooltip: localized.raw(defeatMapping.dreamer + "'s Seal broken"),
						imageUrl: `/ingame-sprites/achievement/${defeatMapping.achievementSprite}.png`,
						group: splitGroupsHollow.dreamer,
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
						const split = createRecordingSplitFromEnemy(
							event.msIntoGame,
							enemyName,
							enemyInfo,
							event.previousPlayerPositionEvent,
						);
						splits.push(split);
						console.log('kill split', split);
					}
				});
			}
		} else if (field === playerDataFieldsHollow.byFieldName.killsMegaBeamMiner) {
			// our good friend the Crystal Guardian has a little special case
			// its second form does not have a separate killed field, nor defeated field (afaik)
			// so we need to check the kills field, which at first is 2 an is decreased with each kill
			// since the killed field handles the first version, only the second version is interesting

			recording.allPlayerDataEventsOfField(field).forEach((event) => {
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
			});
		} else if (field === playerDataFieldsHollow.byFieldName.greyPrinceDefeats) {
			const enemyInfo = enemies.byPlayerDataName.GreyPrince;
			recording.allPlayerDataEventsOfField(field).forEach((event) => {
				if (event.value >= 1 && event.previousPlayerDataEventOfField?.value !== event.value) {
					const enemyName =
						greyPrinceNames.at(event.value >= greyPrinceNames.length ? -1 : event.value - 1) ??
						greyPrinceNames[0]!;
					splits.push({
						...createRecordingSplitFromEnemy(
							event.msIntoGame,
							enemyName,
							enemyInfo,
							event.previousPlayerPositionEvent,
							enemyName,
						),
						subtitle: localized.raw('Level ' + event.value),
					});
				}
			});
		} else if (isPlayerDataAbilityOrItemField(field)) {
			const abilityOrItem = abilitiesAndItems[field.name];
			if (!abilityOrItem) continue;
			recording.allPlayerDataEventsOfField(field).forEach((event) => {
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
						title: localized.raw(abilityOrItem.name),
						tooltip: localized.raw(`Got ${abilityOrItem.name}`),
						imageUrl: `/ingame-sprites/inventory/${abilityOrItem.spriteName}.png`,
						group:
							abilityOrItem.type === 'item'
								? splitGroupsHollow.items
								: abilityOrItem.type === 'ability'
									? splitGroupsHollow.abilities
									: assertNever(abilityOrItem.type),
						debugInfo: event,
						previousPlayerPositionEvent: event.previousPlayerPositionEvent,
					});
				}
			});
		} else if (field === playerDataFieldsHollow.byFieldName.charmSlots) {
			recording.allPlayerDataEventsOfField(field).forEach((event) => {
				if (
					event.value > getDefaultValue(playerDataFieldsHollow.byFieldName.charmSlots) &&
					event.previousPlayerDataEventOfField?.value !== event.value
				) {
					splits.push({
						msIntoGame: event.msIntoGame,
						title: localized.raw(`Charm Notch (nr ${event.value})`),
						tooltip: localized.raw(`Got ${event.value} Charm Notches`),
						imageUrl: '/ingame-sprites/inventory/Inv_0027_spell_slot.png',
						group: splitGroupsHollow.charmCollection,
						debugInfo: event,
						previousPlayerPositionEvent: event.previousPlayerPositionEvent,
					});
				}
			});
		} else if (field === playerDataFieldsHollow.byFieldName.hasDreamNail) {
			recording.allPlayerDataEventsOfField(field).forEach((event) => {
				if (event.value && !event.previousPlayerDataEventOfField?.value) {
					splits.push({
						msIntoGame: event.msIntoGame,
						title: localized.raw('Dream Nail'),
						tooltip: localized.raw('Got the Dream Nail'),
						imageUrl: '/ingame-sprites/inventory/dream_nail_0003_1.png',
						group: splitGroupsHollow.abilities,
						debugInfo: event,
						previousPlayerPositionEvent: event.previousPlayerPositionEvent,
					});
				}
			});
		} else if (field === playerDataFieldsHollow.byFieldName.hasDreamGate) {
			recording.allPlayerDataEventsOfField(field).forEach((event) => {
				if (event.value && !event.previousPlayerDataEventOfField?.value) {
					splits.push({
						msIntoGame: event.msIntoGame,
						title: localized.raw('Dream Gate'),
						tooltip: localized.raw('Got the Dream Gate'),
						imageUrl: '/ingame-sprites/inventory/dream_gate_inv_icon.png',
						group: splitGroupsHollow.abilities,
						debugInfo: event,
						previousPlayerPositionEvent: event.previousPlayerPositionEvent,
					});
				}
			});
		} else if (field === playerDataFieldsHollow.byFieldName.dreamNailUpgraded) {
			recording.allPlayerDataEventsOfField(field).forEach((event) => {
				if (event.value && !event.previousPlayerDataEventOfField?.value) {
					splits.push({
						msIntoGame: event.msIntoGame,
						title: localized.raw('Awoken Dream Nail'),
						tooltip: localized.raw('Awoke the the Dream Nail'),
						imageUrl: '/ingame-sprites/inventory/dream_nail_0000_4.png',
						group: splitGroupsHollow.abilities,
						debugInfo: event,
						previousPlayerPositionEvent: event.previousPlayerPositionEvent,
					});
				}
			});
		} else if (field === playerDataFieldsHollow.byFieldName.nailSmithUpgrades) {
			recording.allPlayerDataEventsOfField(field).forEach((event) => {
				if (event.value === 1 && event.previousPlayerDataEventOfField?.value !== 1) {
					splits.push({
						msIntoGame: event.msIntoGame,
						title: localized.raw(`Sharpened Nail`),
						tooltip: localized.raw(`Upgraded Nail first time`),
						imageUrl: '/ingame-sprites/inventory/nail_upgrade_0002_sharpened_nail.png',
						group: splitGroupsHollow.items,
						debugInfo: event,
						previousPlayerPositionEvent: event.previousPlayerPositionEvent,
					});
				} else if (event.value === 2 && event.previousPlayerDataEventOfField?.value !== 2) {
					splits.push({
						msIntoGame: event.msIntoGame,
						title: localized.raw(`Channelled Nail`),
						tooltip: localized.raw(`Upgraded Nail second time`),
						imageUrl: '/ingame-sprites/inventory/nail_upgrade_0002_channel-nail.png',
						group: splitGroupsHollow.items,
						debugInfo: event,
						previousPlayerPositionEvent: event.previousPlayerPositionEvent,
					});
				} else if (event.value === 3 && event.previousPlayerDataEventOfField?.value !== 3) {
					splits.push({
						msIntoGame: event.msIntoGame,
						title: localized.raw(`Coiled Nail`),
						tooltip: localized.raw(`Upgraded Nail third time`),
						imageUrl: '/ingame-sprites/inventory/nail_upgrade_03_coil_nail.png',
						group: splitGroupsHollow.items,
						debugInfo: event,
						previousPlayerPositionEvent: event.previousPlayerPositionEvent,
					});
				} else if (event.value === 4 && event.previousPlayerDataEventOfField?.value !== 4) {
					splits.push({
						msIntoGame: event.msIntoGame,
						title: localized.raw(`Pure Nail`),
						tooltip: localized.raw(`Upgraded Nail forth time`),
						imageUrl: '/ingame-sprites/inventory/nail_upgrade_0000_pure-nail.png',
						group: splitGroupsHollow.items,
						debugInfo: event,
						previousPlayerPositionEvent: event.previousPlayerPositionEvent,
					});
				}
			});
		} else if (field === playerDataFieldsHollow.byFieldName.heartPieces) {
			recording.allPlayerDataEventsOfField(field).forEach((event) => {
				if (
					event.value > 0 &&
					event.previousPlayerDataEventOfField &&
					event.value !== event.previousPlayerDataEventOfField.value
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
						title: localized.raw(`Mask Shard (${event.value}/4)`),
						tooltip: localized.raw(`Got a Mask Shard (${event.value}/4)`),
						imageUrl: `/ingame-sprites/inventory/${image}.png`,
						group: splitGroupsHollow.items,
						debugInfo: event,
						previousPlayerPositionEvent: event.previousPlayerPositionEvent,
					});
				}
			});
		} else if (field === playerDataFieldsHollow.byFieldName.vesselFragments) {
			recording.allPlayerDataEventsOfField(field).forEach((event) => {
				if (
					event.value > 0 &&
					event.previousPlayerDataEventOfField &&
					event.value !== event.previousPlayerDataEventOfField.value
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
						title: localized.raw(`Vessel Fragment (${event.value}/3)`),
						tooltip: localized.raw(`Got a Vessel Fragment (${event.value}/3)`),
						imageUrl: `/ingame-sprites/inventory/${image}.png`,
						group: splitGroupsHollow.items,
						debugInfo: event,
						previousPlayerPositionEvent: event.previousPlayerPositionEvent,
					});
				}
			});
		} else {
			[
				{ field: playerDataFieldsHollow.byFieldName.mapAbyss, title: localized.raw('Abyss Map') },
				{
					field: playerDataFieldsHollow.byFieldName.mapCity,
					title: localized.raw('City of Tears Map'),
				},
				{ field: playerDataFieldsHollow.byFieldName.mapCliffs, title: localized.raw('Howling Cliffs Map') },
				{
					field: playerDataFieldsHollow.byFieldName.mapCrossroads,
					title: localized.raw('Forgotten Crossroads Map'),
				},
				{ field: playerDataFieldsHollow.byFieldName.mapDeepnest, title: localized.raw('Deepnest Map') },
				{
					field: playerDataFieldsHollow.byFieldName.mapFogCanyon,
					title: localized.raw('Fog Canyon Map'),
				},
				{ field: playerDataFieldsHollow.byFieldName.mapGreenpath, title: localized.raw('Greenpath Map') },
				{
					field: playerDataFieldsHollow.byFieldName.mapMines,
					title: localized.raw('Crystal Peak Map'),
				},
				{ field: playerDataFieldsHollow.byFieldName.mapOutskirts, title: localized.raw("Kingdom's Edge Map") },
				{
					field: playerDataFieldsHollow.byFieldName.mapRestingGrounds,
					title: localized.raw('Resting Grounds Map'),
				},
				{
					field: playerDataFieldsHollow.byFieldName.mapRoyalGardens,
					title: localized.raw("Queen's Gardens Map"),
				},

				{
					field: playerDataFieldsHollow.byFieldName.mapFungalWastes,
					title: localized.raw('Fungal Wastes Map'),
				},
				{ field: playerDataFieldsHollow.byFieldName.mapWaterways, title: localized.raw('Royal Waterways Map') },
			].map((map) => {
				if (field === map.field) {
					recording.allPlayerDataEventsOfField(field).forEach((event) => {
						if (event.value && !event.previousPlayerDataEventOfField?.value) {
							splits.push({
								msIntoGame: event.msIntoGame,
								title: map.title,
								tooltip: localized.concat(localized.raw('Got '), map.title),
								imageUrl: '/ingame-sprites/inventory/inv_item__0008_jar_col_map.png',
								group: splitGroupsHollow.items,
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
					title: localized.raw(`${virtualCharm.name}`),
					subtitle: virtualCharm.subtitle ? localized.raw(virtualCharm.subtitle) : undefined,
					tooltip: localized.raw(`Got ${virtualCharm.name}`),
					imageUrl: `/ingame-sprites/charms/${virtualCharm.spriteName}.png`,
					group: splitGroupsHollow.charmCollection,
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
				title: localized.raw('Delicate Flower'),
				tooltip: localized.raw('Got Delicate Flower'),
				imageUrl: '/ingame-sprites/inventory/White_Flower_Full.png',
				group: splitGroupsHollow.items,
				debugInfo: undefined,
				previousPlayerPositionEvent: frameEndEvent.previousPlayerPositionEvent,
			});
		}
		if (!hadBrokenFlowerLastFrame && xunFlowerBrokenThisFrame) {
			splits.push({
				msIntoGame: frameEndEvent.msIntoGame,
				title: localized.raw('Ruined Flower'),
				tooltip: localized.raw('Broke Delicate Flower'),
				imageUrl: '/ingame-sprites/inventory/White_Flower_Half.png',
				group: splitGroupsHollow.items,
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
				title: localized.raw('Vengeful Spirit'),
				tooltip: localized.raw('Got Vengeful Spirit'),
				imageUrl: '/ingame-sprites/inventory/Inv_0025_spell_fireball_01.png',
				group: splitGroupsHollow.abilities,
				debugInfo: undefined,
				previousPlayerPositionEvent: frameEndEvent.previousPlayerPositionEvent,
			});
		}
		if (frameEndEvent.fireballLevel === 2 && frameEndEvent.previousFrameEndEvent?.fireballLevel !== 2) {
			splits.push({
				msIntoGame: frameEndEvent.msIntoGame,
				title: localized.raw('Shade Soul'),
				tooltip: localized.raw('Got Shade Soul (upgrade for Vengeful Spirit)'),
				imageUrl: '/ingame-sprites/inventory/Inv_0025_spell_fireball_01_level2.png',
				group: splitGroupsHollow.abilities,
				debugInfo: undefined,
				previousPlayerPositionEvent: frameEndEvent.previousPlayerPositionEvent,
			});
		}
		// up spell
		if (frameEndEvent.screamLevel === 1 && frameEndEvent.previousFrameEndEvent?.screamLevel !== 1) {
			splits.push({
				msIntoGame: frameEndEvent.msIntoGame,
				title: localized.raw('Howling Wraiths'),
				tooltip: localized.raw('Got Howling Wraiths'),
				imageUrl: '/ingame-sprites/inventory/Inv_0024_spell_scream_01.png',
				group: splitGroupsHollow.abilities,
				debugInfo: undefined,
				previousPlayerPositionEvent: frameEndEvent.previousPlayerPositionEvent,
			});
		}
		if (frameEndEvent.screamLevel === 2 && frameEndEvent.previousFrameEndEvent?.screamLevel !== 2) {
			splits.push({
				msIntoGame: frameEndEvent.msIntoGame,
				title: localized.raw('Abyss Shriek'),
				tooltip: localized.raw('Got Abyss Shriek (upgrade for Howling Wraiths)'),
				imageUrl: '/ingame-sprites/inventory/Inv_0024_spell_scream_01_level2.png',
				group: splitGroupsHollow.abilities,
				debugInfo: undefined,
				previousPlayerPositionEvent: frameEndEvent.previousPlayerPositionEvent,
			});
		}
		// down spell
		if (frameEndEvent.quakeLevel === 1 && frameEndEvent.previousFrameEndEvent?.quakeLevel !== 1) {
			splits.push({
				msIntoGame: frameEndEvent.msIntoGame,
				title: localized.raw('Desolate Dive'),
				tooltip: localized.raw('Got Desolate Dive'),
				imageUrl: '/ingame-sprites/inventory/Inv_0026_spell_quake_01.png',
				group: splitGroupsHollow.abilities,
				debugInfo: undefined,
				previousPlayerPositionEvent: frameEndEvent.previousPlayerPositionEvent,
			});
		}
		if (frameEndEvent.quakeLevel === 2 && frameEndEvent.previousFrameEndEvent?.quakeLevel !== 2) {
			splits.push({
				msIntoGame: frameEndEvent.msIntoGame,
				title: localized.raw('Descending Dark'),
				tooltip: localized.raw('Got Descending Dark (upgrade for Desolate Dive)'),
				imageUrl: '/ingame-sprites/inventory/Inv_0026_spell_quake_01_level2.png',
				group: splitGroupsHollow.abilities,
				debugInfo: undefined,
				previousPlayerPositionEvent: frameEndEvent.previousPlayerPositionEvent,
			});
		}
	}

	return splits.sort((a, b) => a.msIntoGame - b.msIntoGame);
}
