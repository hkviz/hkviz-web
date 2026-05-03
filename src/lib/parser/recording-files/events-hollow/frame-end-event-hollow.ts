import { heroStateFieldsHollow, type HeroStateFieldHollow } from '../../../game-data/hollow-data/hero-states';
import type {
	PlayerDataFieldNameHollow,
	PlayerDataFieldValueHollow,
} from '../../../game-data/hollow-data/player-data-hollow';
import { getDefaultPlayerDataValueHollow as getDefaultPlayerDataValue } from '../../../game-data/hollow-data/player-data-hollow';
import { type BossSequenceDoorCompletion } from '../../player-data/boss-completion';
import type { EventCreationContext } from '../events-shared/event-creation-context';
import { FrameEndEventBase } from '../events-shared/frame-end-event-base';
import { type PlayerPositionEvent } from '../events-shared/player-position-event';
import { countGameCompletion } from '../parser-hollow/ingame-percentage';
import type { HeroStateEvent } from './hero-state-event';
import { type PlayerDataEventHollow } from './player-data-event-hollow';

export const frameEndEventPlayerDataFieldsHollow = [
	// geo
	'geo',
	'geoPool',
	'trinket1',
	'trinket2',
	'trinket3',
	'trinket4',

	// health
	'health',
	'maxHealth',
	'healthBlue',

	// soul
	'MPCharge',
	'MPReserve',

	// percentage
	'killedFalseKnight',
	'hornet1Defeated',
	'hornetOutskirtsDefeated',
	'killedMantisLord',
	'killedMageLord',
	'killedDungDefender',
	'killedBlackKnight',
	'killedInfectedKnight',
	'killedMimicSpider',
	'killedMegaJellyfish',
	'killedTraitorLord',
	'killedJarCollector',
	'killedBigFly',
	'killedMawlek',
	'killedHiveKnight',
	'colosseumBronzeCompleted',
	'colosseumSilverCompleted',
	'colosseumGoldCompleted',
	'killedGhostAladar',
	'killedGhostHu',
	'killedGhostXero',
	'killedGhostMarkoth',
	'killedGhostNoEyes',
	'killedGhostMarmu',
	'killedGhostGalien',
	'fireballLevel',
	'quakeLevel',
	'screamLevel',
	'hasCyclone',
	'hasDashSlash',
	'hasUpwardSlash',
	'hasDash',
	'hasWalljump',
	'hasDoubleJump',
	'hasAcidArmour',
	'hasSuperDash',
	'hasShadowDash',
	'hasKingsBrand',
	'lurienDefeated',
	'hegemolDefeated',
	'monomonDefeated',
	'hasDreamNail',
	'dreamOrbs',
	'dreamNailUpgraded',
	'mothDeparted',
	'nailSmithUpgrades',
	'maxHealthBase',
	'MPReserveMax',
	'killedGrimm',
	'killedNightmareGrimm',
	'destroyedNightmareLantern',
	'hasGodfinder',
	'bossDoorStateTier1',
	'bossDoorStateTier2',
	'bossDoorStateTier3',
	'bossDoorStateTier4',

	// charms
	'gotCharm_1',
	'gotCharm_2',
	'gotCharm_3',
	'gotCharm_4',
	'gotCharm_5',
	'gotCharm_6',
	'gotCharm_7',
	'gotCharm_8',
	'gotCharm_9',
	'gotCharm_10',
	'gotCharm_11',
	'gotCharm_12',
	'gotCharm_13',
	'gotCharm_14',
	'gotCharm_15',
	'gotCharm_16',
	'gotCharm_17',
	'gotCharm_18',
	'gotCharm_19',
	'gotCharm_20',
	'gotCharm_21',
	'gotCharm_22',
	'gotCharm_23',
	'gotCharm_24',
	'gotCharm_25',
	'gotCharm_26',
	'gotCharm_27',
	'gotCharm_28',
	'gotCharm_29',
	'gotCharm_30',
	'gotCharm_31',
	'gotCharm_32',
	'gotCharm_33',
	'gotCharm_34',
	'gotCharm_35',
	'gotCharm_36',
	'gotCharm_37',
	'gotCharm_38',
	'gotCharm_39',
	'gotCharm_40',
	'royalCharmState',

	'fragileHealth_unbreakable',
	'fragileStrength_unbreakable',
	'fragileGreed_unbreakable',
	'brokenCharm_23',
	'brokenCharm_24',
	'brokenCharm_25',
	'grimmChildLevel',

	'completionPercentage',

	// grubs
	'grubsCollected',
	'grubRewards',

	// flower
	'hasXunFlower',
	'xunFlowerBroken',

	// shade
	'shadeScene',
	'shadePositionX',
	'shadePositionY',

	// dreamgate
	'dreamGateScene',
	'dreamGateX',
	'dreamGateY',
] satisfies PlayerDataFieldNameHollow[];
export const frameEndEventPlayerDataFieldsSetHollow = new Set<PlayerDataFieldNameHollow>(
	frameEndEventPlayerDataFieldsHollow,
);

type FrameEndEventPlayerDataFieldNameHollow = (typeof frameEndEventPlayerDataFieldsHollow)[number];

export const frameEndHeroStateFieldsArray = [heroStateFieldsHollow.byFieldName.dead] as const;

export const frameEndEventHeroStateFields = new Set<HeroStateFieldHollow>(frameEndHeroStateFieldsArray);

type FrameEndEventHeroStateField = (typeof frameEndHeroStateFieldsArray)[number];

type FrameEndBase = {
	[TField in FrameEndEventHeroStateField as TField['name']]: boolean;
} & {
	[TField in FrameEndEventPlayerDataFieldNameHollow]: PlayerDataFieldValueHollow<TField>;
};

// use this to auto generate the constructor

// console.log(
//     frameEndEventPlayerDataFieldsArray
//         .map(
//             (it) => `
//                 const previous${it.name} = getPreviousPlayerData(playerDataFields.byFieldName.${it.name});
//                 this.${it.name} = previous${it.name} ? previous${it.name}.value : getDefaultPlayerDataValue(playerDataFields.byFieldName.${it.name});
//             `,
//         )
//         .join('') +
//         frameEndHeroStateFieldsArray
//             .map(
//                 (it) => `
//                 this.${it.name} = getPreviousHeroState(heroStateFields.byFieldName.${it.name})?.value ?? false;
//             `,
//             )
//             .join(''),
// );

/**
 * Synthetic event / not actually recorded
 * created by recording combiner whenever the timestamp changes if any of the values in it changed
 */

export class FrameEndEventHollow extends FrameEndEventBase implements FrameEndBase {
	// directly from player data and hero states

	dead: boolean;
	health: number;
	maxHealth: number;
	maxHealthBase: number;
	healthBlue: number;
	geo: number;
	MPCharge: number;
	MPReserve: number;
	MPReserveMax: number;
	geoPool: number;
	fireballLevel: number;
	quakeLevel: number;
	screamLevel: number;
	hasCyclone: boolean;
	hasDashSlash: boolean;
	hasUpwardSlash: boolean;
	hasDreamNail: boolean;
	dreamNailUpgraded: boolean;
	dreamOrbs: number;
	hasDash: boolean;
	hasWalljump: boolean;
	hasSuperDash: boolean;
	hasShadowDash: boolean;
	hasAcidArmour: boolean;
	hasDoubleJump: boolean;
	hasKingsBrand: boolean;
	trinket1: number;
	trinket2: number;
	trinket3: number;
	trinket4: number;
	lurienDefeated: boolean;
	hegemolDefeated: boolean;
	monomonDefeated: boolean;
	mothDeparted: boolean;
	nailSmithUpgrades: number;
	colosseumBronzeCompleted: boolean;
	colosseumSilverCompleted: boolean;
	colosseumGoldCompleted: boolean;
	gotCharm_1: boolean;
	gotCharm_2: boolean;
	gotCharm_3: boolean;
	gotCharm_4: boolean;
	gotCharm_5: boolean;
	gotCharm_6: boolean;
	gotCharm_7: boolean;
	gotCharm_8: boolean;
	gotCharm_9: boolean;
	gotCharm_10: boolean;
	gotCharm_11: boolean;
	gotCharm_12: boolean;
	gotCharm_13: boolean;
	gotCharm_14: boolean;
	gotCharm_15: boolean;
	gotCharm_16: boolean;
	gotCharm_17: boolean;
	gotCharm_18: boolean;
	gotCharm_19: boolean;
	gotCharm_20: boolean;
	gotCharm_21: boolean;
	gotCharm_22: boolean;
	gotCharm_23: boolean;
	brokenCharm_23: boolean;
	gotCharm_24: boolean;
	brokenCharm_24: boolean;
	gotCharm_25: boolean;
	brokenCharm_25: boolean;
	gotCharm_26: boolean;
	gotCharm_27: boolean;
	gotCharm_28: boolean;
	gotCharm_29: boolean;
	gotCharm_30: boolean;
	gotCharm_31: boolean;
	gotCharm_32: boolean;
	gotCharm_33: boolean;
	gotCharm_34: boolean;
	gotCharm_35: boolean;
	gotCharm_36: boolean;
	gotCharm_37: boolean;
	gotCharm_38: boolean;
	gotCharm_39: boolean;
	gotCharm_40: boolean;
	fragileHealth_unbreakable: boolean;
	fragileGreed_unbreakable: boolean;
	fragileStrength_unbreakable: boolean;
	royalCharmState: number;
	killedBigFly: boolean;
	killedMawlek: boolean;
	killedFalseKnight: boolean;
	killedInfectedKnight: boolean;
	killedMegaJellyfish: boolean;
	killedMantisLord: boolean;
	killedBlackKnight: boolean;
	killedJarCollector: boolean;
	killedMageLord: boolean;
	killedDungDefender: boolean;
	killedMimicSpider: boolean;
	killedHiveKnight: boolean;
	killedTraitorLord: boolean;
	killedGhostAladar: boolean;
	killedGhostXero: boolean;
	killedGhostHu: boolean;
	killedGhostMarmu: boolean;
	killedGhostNoEyes: boolean;
	killedGhostMarkoth: boolean;
	killedGhostGalien: boolean;
	killedGrimm: boolean;
	killedNightmareGrimm: boolean;
	grubsCollected: number;
	grubRewards: number;
	hornet1Defeated: boolean;
	hornetOutskirtsDefeated: boolean;
	grimmChildLevel: number;
	destroyedNightmareLantern: boolean;
	completionPercentage: number;
	bossDoorStateTier1: BossSequenceDoorCompletion;
	bossDoorStateTier2: BossSequenceDoorCompletion;
	bossDoorStateTier3: BossSequenceDoorCompletion;
	bossDoorStateTier4: BossSequenceDoorCompletion;
	hasGodfinder: boolean;

	hasXunFlower: boolean;
	xunFlowerBroken: boolean;

	// computed properties
	previousFrameEndEvent: FrameEndEventHollow | null = null;
	previousPlayerPositionEvent: PlayerPositionEvent | null = null;

	completionPercentageEarlyCalc: number;
	healthLost: number;
	trinketGeo: number;
	geoTotal: number;
	grubsNoRewardCollected: number;
	MPTotal: number;

	healthTotal: number;

	// shade
	shadeScene: string;
	shadePositionX: number;
	shadePositionY: number;

	// dreamgate
	dreamGateScene: string;
	dreamGateX: number;
	dreamGateY: number;

	constructor(
		previousFrameEndEvent: FrameEndEventHollow | null,
		previousPlayerPositionEvent: PlayerPositionEvent | null,
		getPreviousPlayerData: <TFieldName extends PlayerDataFieldNameHollow>(
			field: TFieldName,
		) => PlayerDataEventHollow<TFieldName> | undefined,
		getPreviousHeroState: (field: HeroStateFieldHollow) => HeroStateEvent | undefined,
		ctx: EventCreationContext,
	) {
		super(ctx);

		this.previousFrameEndEvent = previousFrameEndEvent;
		this.previousPlayerPositionEvent = previousPlayerPositionEvent;

		// start auto generated from code above
		// meta programming sadly produced a properties array for each instance, which is not acceptable
		// for this object as it is instantiated very often

		const previousgeo = getPreviousPlayerData('geo');
		this.geo = previousgeo ? previousgeo.value : getDefaultPlayerDataValue('geo');

		const previousgeoPool = getPreviousPlayerData('geoPool');
		this.geoPool = previousgeoPool ? previousgeoPool.value : getDefaultPlayerDataValue('geoPool');

		const previoustrinket1 = getPreviousPlayerData('trinket1');
		this.trinket1 = previoustrinket1 ? previoustrinket1.value : getDefaultPlayerDataValue('trinket1');

		const previoustrinket2 = getPreviousPlayerData('trinket2');
		this.trinket2 = previoustrinket2 ? previoustrinket2.value : getDefaultPlayerDataValue('trinket2');

		const previoustrinket3 = getPreviousPlayerData('trinket3');
		this.trinket3 = previoustrinket3 ? previoustrinket3.value : getDefaultPlayerDataValue('trinket3');

		const previoustrinket4 = getPreviousPlayerData('trinket4');
		this.trinket4 = previoustrinket4 ? previoustrinket4.value : getDefaultPlayerDataValue('trinket4');

		const previoushealth = getPreviousPlayerData('health');
		this.health = previoushealth ? previoushealth.value : getDefaultPlayerDataValue('health');

		const previousmaxHealth = getPreviousPlayerData('maxHealth');
		this.maxHealth = previousmaxHealth ? previousmaxHealth.value : getDefaultPlayerDataValue('maxHealth');

		const previoushealthBlue = getPreviousPlayerData('healthBlue');
		this.healthBlue = previoushealthBlue ? previoushealthBlue.value : getDefaultPlayerDataValue('healthBlue');

		const previousMPCharge = getPreviousPlayerData('MPCharge');
		this.MPCharge = previousMPCharge ? previousMPCharge.value : getDefaultPlayerDataValue('MPCharge');

		const previousMPReserve = getPreviousPlayerData('MPReserve');
		this.MPReserve = previousMPReserve ? previousMPReserve.value : getDefaultPlayerDataValue('MPReserve');

		const previouskilledFalseKnight = getPreviousPlayerData('killedFalseKnight');
		this.killedFalseKnight = previouskilledFalseKnight
			? previouskilledFalseKnight.value
			: getDefaultPlayerDataValue('killedFalseKnight');

		const previoushornet1Defeated = getPreviousPlayerData('hornet1Defeated');
		this.hornet1Defeated = previoushornet1Defeated
			? previoushornet1Defeated.value
			: getDefaultPlayerDataValue('hornet1Defeated');

		const previoushornetOutskirtsDefeated = getPreviousPlayerData('hornetOutskirtsDefeated');
		this.hornetOutskirtsDefeated = previoushornetOutskirtsDefeated
			? previoushornetOutskirtsDefeated.value
			: getDefaultPlayerDataValue('hornetOutskirtsDefeated');

		const previouskilledMantisLord = getPreviousPlayerData('killedMantisLord');
		this.killedMantisLord = previouskilledMantisLord
			? previouskilledMantisLord.value
			: getDefaultPlayerDataValue('killedMantisLord');

		const previouskilledMageLord = getPreviousPlayerData('killedMageLord');
		this.killedMageLord = previouskilledMageLord
			? previouskilledMageLord.value
			: getDefaultPlayerDataValue('killedMageLord');

		const previouskilledDungDefender = getPreviousPlayerData('killedDungDefender');
		this.killedDungDefender = previouskilledDungDefender
			? previouskilledDungDefender.value
			: getDefaultPlayerDataValue('killedDungDefender');

		const previouskilledBlackKnight = getPreviousPlayerData('killedBlackKnight');
		this.killedBlackKnight = previouskilledBlackKnight
			? previouskilledBlackKnight.value
			: getDefaultPlayerDataValue('killedBlackKnight');

		const previouskilledInfectedKnight = getPreviousPlayerData('killedInfectedKnight');
		this.killedInfectedKnight = previouskilledInfectedKnight
			? previouskilledInfectedKnight.value
			: getDefaultPlayerDataValue('killedInfectedKnight');

		const previouskilledMimicSpider = getPreviousPlayerData('killedMimicSpider');
		this.killedMimicSpider = previouskilledMimicSpider
			? previouskilledMimicSpider.value
			: getDefaultPlayerDataValue('killedMimicSpider');

		const previouskilledMegaJellyfish = getPreviousPlayerData('killedMegaJellyfish');
		this.killedMegaJellyfish = previouskilledMegaJellyfish
			? previouskilledMegaJellyfish.value
			: getDefaultPlayerDataValue('killedMegaJellyfish');

		const previouskilledTraitorLord = getPreviousPlayerData('killedTraitorLord');
		this.killedTraitorLord = previouskilledTraitorLord
			? previouskilledTraitorLord.value
			: getDefaultPlayerDataValue('killedTraitorLord');

		const previouskilledJarCollector = getPreviousPlayerData('killedJarCollector');
		this.killedJarCollector = previouskilledJarCollector
			? previouskilledJarCollector.value
			: getDefaultPlayerDataValue('killedJarCollector');

		const previouskilledBigFly = getPreviousPlayerData('killedBigFly');
		this.killedBigFly = previouskilledBigFly
			? previouskilledBigFly.value
			: getDefaultPlayerDataValue('killedBigFly');

		const previouskilledMawlek = getPreviousPlayerData('killedMawlek');
		this.killedMawlek = previouskilledMawlek
			? previouskilledMawlek.value
			: getDefaultPlayerDataValue('killedMawlek');

		const previouskilledHiveKnight = getPreviousPlayerData('killedHiveKnight');
		this.killedHiveKnight = previouskilledHiveKnight
			? previouskilledHiveKnight.value
			: getDefaultPlayerDataValue('killedHiveKnight');

		const previouscolosseumBronzeCompleted = getPreviousPlayerData('colosseumBronzeCompleted');
		this.colosseumBronzeCompleted = previouscolosseumBronzeCompleted
			? previouscolosseumBronzeCompleted.value
			: getDefaultPlayerDataValue('colosseumBronzeCompleted');

		const previouscolosseumSilverCompleted = getPreviousPlayerData('colosseumSilverCompleted');
		this.colosseumSilverCompleted = previouscolosseumSilverCompleted
			? previouscolosseumSilverCompleted.value
			: getDefaultPlayerDataValue('colosseumSilverCompleted');

		const previouscolosseumGoldCompleted = getPreviousPlayerData('colosseumGoldCompleted');
		this.colosseumGoldCompleted = previouscolosseumGoldCompleted
			? previouscolosseumGoldCompleted.value
			: getDefaultPlayerDataValue('colosseumGoldCompleted');

		const previouskilledGhostAladar = getPreviousPlayerData('killedGhostAladar');
		this.killedGhostAladar = previouskilledGhostAladar
			? previouskilledGhostAladar.value
			: getDefaultPlayerDataValue('killedGhostAladar');

		const previouskilledGhostHu = getPreviousPlayerData('killedGhostHu');
		this.killedGhostHu = previouskilledGhostHu
			? previouskilledGhostHu.value
			: getDefaultPlayerDataValue('killedGhostHu');

		const previouskilledGhostXero = getPreviousPlayerData('killedGhostXero');
		this.killedGhostXero = previouskilledGhostXero
			? previouskilledGhostXero.value
			: getDefaultPlayerDataValue('killedGhostXero');

		const previouskilledGhostMarkoth = getPreviousPlayerData('killedGhostMarkoth');
		this.killedGhostMarkoth = previouskilledGhostMarkoth
			? previouskilledGhostMarkoth.value
			: getDefaultPlayerDataValue('killedGhostMarkoth');

		const previouskilledGhostNoEyes = getPreviousPlayerData('killedGhostNoEyes');
		this.killedGhostNoEyes = previouskilledGhostNoEyes
			? previouskilledGhostNoEyes.value
			: getDefaultPlayerDataValue('killedGhostNoEyes');

		const previouskilledGhostMarmu = getPreviousPlayerData('killedGhostMarmu');
		this.killedGhostMarmu = previouskilledGhostMarmu
			? previouskilledGhostMarmu.value
			: getDefaultPlayerDataValue('killedGhostMarmu');

		const previouskilledGhostGalien = getPreviousPlayerData('killedGhostGalien');
		this.killedGhostGalien = previouskilledGhostGalien
			? previouskilledGhostGalien.value
			: getDefaultPlayerDataValue('killedGhostGalien');

		const previousfireballLevel = getPreviousPlayerData('fireballLevel');
		this.fireballLevel = previousfireballLevel
			? previousfireballLevel.value
			: getDefaultPlayerDataValue('fireballLevel');

		const previousquakeLevel = getPreviousPlayerData('quakeLevel');
		this.quakeLevel = previousquakeLevel ? previousquakeLevel.value : getDefaultPlayerDataValue('quakeLevel');

		const previousscreamLevel = getPreviousPlayerData('screamLevel');
		this.screamLevel = previousscreamLevel ? previousscreamLevel.value : getDefaultPlayerDataValue('screamLevel');

		const previoushasCyclone = getPreviousPlayerData('hasCyclone');
		this.hasCyclone = previoushasCyclone ? previoushasCyclone.value : getDefaultPlayerDataValue('hasCyclone');

		const previoushasDashSlash = getPreviousPlayerData('hasDashSlash');
		this.hasDashSlash = previoushasDashSlash
			? previoushasDashSlash.value
			: getDefaultPlayerDataValue('hasDashSlash');

		const previoushasUpwardSlash = getPreviousPlayerData('hasUpwardSlash');
		this.hasUpwardSlash = previoushasUpwardSlash
			? previoushasUpwardSlash.value
			: getDefaultPlayerDataValue('hasUpwardSlash');

		const previoushasDash = getPreviousPlayerData('hasDash');
		this.hasDash = previoushasDash ? previoushasDash.value : getDefaultPlayerDataValue('hasDash');

		const previoushasWalljump = getPreviousPlayerData('hasWalljump');
		this.hasWalljump = previoushasWalljump ? previoushasWalljump.value : getDefaultPlayerDataValue('hasWalljump');

		const previoushasDoubleJump = getPreviousPlayerData('hasDoubleJump');
		this.hasDoubleJump = previoushasDoubleJump
			? previoushasDoubleJump.value
			: getDefaultPlayerDataValue('hasDoubleJump');

		const previoushasAcidArmour = getPreviousPlayerData('hasAcidArmour');
		this.hasAcidArmour = previoushasAcidArmour
			? previoushasAcidArmour.value
			: getDefaultPlayerDataValue('hasAcidArmour');

		const previoushasSuperDash = getPreviousPlayerData('hasSuperDash');
		this.hasSuperDash = previoushasSuperDash
			? previoushasSuperDash.value
			: getDefaultPlayerDataValue('hasSuperDash');

		const previoushasShadowDash = getPreviousPlayerData('hasShadowDash');
		this.hasShadowDash = previoushasShadowDash
			? previoushasShadowDash.value
			: getDefaultPlayerDataValue('hasShadowDash');

		const previoushasKingsBrand = getPreviousPlayerData('hasKingsBrand');
		this.hasKingsBrand = previoushasKingsBrand
			? previoushasKingsBrand.value
			: getDefaultPlayerDataValue('hasKingsBrand');

		const previouslurienDefeated = getPreviousPlayerData('lurienDefeated');
		this.lurienDefeated = previouslurienDefeated
			? previouslurienDefeated.value
			: getDefaultPlayerDataValue('lurienDefeated');

		const previoushegemolDefeated = getPreviousPlayerData('hegemolDefeated');
		this.hegemolDefeated = previoushegemolDefeated
			? previoushegemolDefeated.value
			: getDefaultPlayerDataValue('hegemolDefeated');

		const previousmonomonDefeated = getPreviousPlayerData('monomonDefeated');
		this.monomonDefeated = previousmonomonDefeated
			? previousmonomonDefeated.value
			: getDefaultPlayerDataValue('monomonDefeated');

		const previoushasDreamNail = getPreviousPlayerData('hasDreamNail');
		this.hasDreamNail = previoushasDreamNail
			? previoushasDreamNail.value
			: getDefaultPlayerDataValue('hasDreamNail');

		const previousdreamNailUpgraded = getPreviousPlayerData('dreamNailUpgraded');
		this.dreamNailUpgraded = previousdreamNailUpgraded
			? previousdreamNailUpgraded.value
			: getDefaultPlayerDataValue('dreamNailUpgraded');

		const previousdreamOrbs = getPreviousPlayerData('dreamOrbs');
		this.dreamOrbs = previousdreamOrbs ? previousdreamOrbs.value : getDefaultPlayerDataValue('dreamOrbs');

		const previousmothDeparted = getPreviousPlayerData('mothDeparted');
		this.mothDeparted = previousmothDeparted
			? previousmothDeparted.value
			: getDefaultPlayerDataValue('mothDeparted');

		const previousnailSmithUpgrades = getPreviousPlayerData('nailSmithUpgrades');
		this.nailSmithUpgrades = previousnailSmithUpgrades
			? previousnailSmithUpgrades.value
			: getDefaultPlayerDataValue('nailSmithUpgrades');

		const previousmaxHealthBase = getPreviousPlayerData('maxHealthBase');
		this.maxHealthBase = previousmaxHealthBase
			? previousmaxHealthBase.value
			: getDefaultPlayerDataValue('maxHealthBase');

		const previousMPReserveMax = getPreviousPlayerData('MPReserveMax');
		this.MPReserveMax = previousMPReserveMax
			? previousMPReserveMax.value
			: getDefaultPlayerDataValue('MPReserveMax');

		const previouskilledGrimm = getPreviousPlayerData('killedGrimm');
		this.killedGrimm = previouskilledGrimm ? previouskilledGrimm.value : getDefaultPlayerDataValue('killedGrimm');

		const previouskilledNightmareGrimm = getPreviousPlayerData('killedNightmareGrimm');
		this.killedNightmareGrimm = previouskilledNightmareGrimm
			? previouskilledNightmareGrimm.value
			: getDefaultPlayerDataValue('killedNightmareGrimm');

		const previousdestroyedNightmareLantern = getPreviousPlayerData('destroyedNightmareLantern');
		this.destroyedNightmareLantern = previousdestroyedNightmareLantern
			? previousdestroyedNightmareLantern.value
			: getDefaultPlayerDataValue('destroyedNightmareLantern');

		const previoushasGodfinder = getPreviousPlayerData('hasGodfinder');
		this.hasGodfinder = previoushasGodfinder
			? previoushasGodfinder.value
			: getDefaultPlayerDataValue('hasGodfinder');

		const previousbossDoorStateTier1 = getPreviousPlayerData('bossDoorStateTier1');
		this.bossDoorStateTier1 = previousbossDoorStateTier1
			? previousbossDoorStateTier1.value
			: getDefaultPlayerDataValue('bossDoorStateTier1');

		const previousbossDoorStateTier2 = getPreviousPlayerData('bossDoorStateTier2');
		this.bossDoorStateTier2 = previousbossDoorStateTier2
			? previousbossDoorStateTier2.value
			: getDefaultPlayerDataValue('bossDoorStateTier2');

		const previousbossDoorStateTier3 = getPreviousPlayerData('bossDoorStateTier3');
		this.bossDoorStateTier3 = previousbossDoorStateTier3
			? previousbossDoorStateTier3.value
			: getDefaultPlayerDataValue('bossDoorStateTier3');

		const previousbossDoorStateTier4 = getPreviousPlayerData('bossDoorStateTier4');
		this.bossDoorStateTier4 = previousbossDoorStateTier4
			? previousbossDoorStateTier4.value
			: getDefaultPlayerDataValue('bossDoorStateTier4');

		const previousgotCharm_1 = getPreviousPlayerData('gotCharm_1');
		this.gotCharm_1 = previousgotCharm_1 ? previousgotCharm_1.value : getDefaultPlayerDataValue('gotCharm_1');

		const previousgotCharm_2 = getPreviousPlayerData('gotCharm_2');
		this.gotCharm_2 = previousgotCharm_2 ? previousgotCharm_2.value : getDefaultPlayerDataValue('gotCharm_2');

		const previousgotCharm_3 = getPreviousPlayerData('gotCharm_3');
		this.gotCharm_3 = previousgotCharm_3 ? previousgotCharm_3.value : getDefaultPlayerDataValue('gotCharm_3');

		const previousgotCharm_4 = getPreviousPlayerData('gotCharm_4');
		this.gotCharm_4 = previousgotCharm_4 ? previousgotCharm_4.value : getDefaultPlayerDataValue('gotCharm_4');

		const previousgotCharm_5 = getPreviousPlayerData('gotCharm_5');
		this.gotCharm_5 = previousgotCharm_5 ? previousgotCharm_5.value : getDefaultPlayerDataValue('gotCharm_5');

		const previousgotCharm_6 = getPreviousPlayerData('gotCharm_6');
		this.gotCharm_6 = previousgotCharm_6 ? previousgotCharm_6.value : getDefaultPlayerDataValue('gotCharm_6');

		const previousgotCharm_7 = getPreviousPlayerData('gotCharm_7');
		this.gotCharm_7 = previousgotCharm_7 ? previousgotCharm_7.value : getDefaultPlayerDataValue('gotCharm_7');

		const previousgotCharm_8 = getPreviousPlayerData('gotCharm_8');
		this.gotCharm_8 = previousgotCharm_8 ? previousgotCharm_8.value : getDefaultPlayerDataValue('gotCharm_8');

		const previousgotCharm_9 = getPreviousPlayerData('gotCharm_9');
		this.gotCharm_9 = previousgotCharm_9 ? previousgotCharm_9.value : getDefaultPlayerDataValue('gotCharm_9');

		const previousgotCharm_10 = getPreviousPlayerData('gotCharm_10');
		this.gotCharm_10 = previousgotCharm_10 ? previousgotCharm_10.value : getDefaultPlayerDataValue('gotCharm_10');

		const previousgotCharm_11 = getPreviousPlayerData('gotCharm_11');
		this.gotCharm_11 = previousgotCharm_11 ? previousgotCharm_11.value : getDefaultPlayerDataValue('gotCharm_11');

		const previousgotCharm_12 = getPreviousPlayerData('gotCharm_12');
		this.gotCharm_12 = previousgotCharm_12 ? previousgotCharm_12.value : getDefaultPlayerDataValue('gotCharm_12');

		const previousgotCharm_13 = getPreviousPlayerData('gotCharm_13');
		this.gotCharm_13 = previousgotCharm_13 ? previousgotCharm_13.value : getDefaultPlayerDataValue('gotCharm_13');

		const previousgotCharm_14 = getPreviousPlayerData('gotCharm_14');
		this.gotCharm_14 = previousgotCharm_14 ? previousgotCharm_14.value : getDefaultPlayerDataValue('gotCharm_14');

		const previousgotCharm_15 = getPreviousPlayerData('gotCharm_15');
		this.gotCharm_15 = previousgotCharm_15 ? previousgotCharm_15.value : getDefaultPlayerDataValue('gotCharm_15');

		const previousgotCharm_16 = getPreviousPlayerData('gotCharm_16');
		this.gotCharm_16 = previousgotCharm_16 ? previousgotCharm_16.value : getDefaultPlayerDataValue('gotCharm_16');

		const previousgotCharm_17 = getPreviousPlayerData('gotCharm_17');
		this.gotCharm_17 = previousgotCharm_17 ? previousgotCharm_17.value : getDefaultPlayerDataValue('gotCharm_17');

		const previousgotCharm_18 = getPreviousPlayerData('gotCharm_18');
		this.gotCharm_18 = previousgotCharm_18 ? previousgotCharm_18.value : getDefaultPlayerDataValue('gotCharm_18');

		const previousgotCharm_19 = getPreviousPlayerData('gotCharm_19');
		this.gotCharm_19 = previousgotCharm_19 ? previousgotCharm_19.value : getDefaultPlayerDataValue('gotCharm_19');

		const previousgotCharm_20 = getPreviousPlayerData('gotCharm_20');
		this.gotCharm_20 = previousgotCharm_20 ? previousgotCharm_20.value : getDefaultPlayerDataValue('gotCharm_20');

		const previousgotCharm_21 = getPreviousPlayerData('gotCharm_21');
		this.gotCharm_21 = previousgotCharm_21 ? previousgotCharm_21.value : getDefaultPlayerDataValue('gotCharm_21');

		const previousgotCharm_22 = getPreviousPlayerData('gotCharm_22');
		this.gotCharm_22 = previousgotCharm_22 ? previousgotCharm_22.value : getDefaultPlayerDataValue('gotCharm_22');

		const previousgotCharm_23 = getPreviousPlayerData('gotCharm_23');
		this.gotCharm_23 = previousgotCharm_23 ? previousgotCharm_23.value : getDefaultPlayerDataValue('gotCharm_23');

		const previousgotCharm_24 = getPreviousPlayerData('gotCharm_24');
		this.gotCharm_24 = previousgotCharm_24 ? previousgotCharm_24.value : getDefaultPlayerDataValue('gotCharm_24');

		const previousgotCharm_25 = getPreviousPlayerData('gotCharm_25');
		this.gotCharm_25 = previousgotCharm_25 ? previousgotCharm_25.value : getDefaultPlayerDataValue('gotCharm_25');

		const previousgotCharm_26 = getPreviousPlayerData('gotCharm_26');
		this.gotCharm_26 = previousgotCharm_26 ? previousgotCharm_26.value : getDefaultPlayerDataValue('gotCharm_26');

		const previousgotCharm_27 = getPreviousPlayerData('gotCharm_27');
		this.gotCharm_27 = previousgotCharm_27 ? previousgotCharm_27.value : getDefaultPlayerDataValue('gotCharm_27');

		const previousgotCharm_28 = getPreviousPlayerData('gotCharm_28');
		this.gotCharm_28 = previousgotCharm_28 ? previousgotCharm_28.value : getDefaultPlayerDataValue('gotCharm_28');

		const previousgotCharm_29 = getPreviousPlayerData('gotCharm_29');
		this.gotCharm_29 = previousgotCharm_29 ? previousgotCharm_29.value : getDefaultPlayerDataValue('gotCharm_29');

		const previousgotCharm_30 = getPreviousPlayerData('gotCharm_30');
		this.gotCharm_30 = previousgotCharm_30 ? previousgotCharm_30.value : getDefaultPlayerDataValue('gotCharm_30');

		const previousgotCharm_31 = getPreviousPlayerData('gotCharm_31');
		this.gotCharm_31 = previousgotCharm_31 ? previousgotCharm_31.value : getDefaultPlayerDataValue('gotCharm_31');

		const previousgotCharm_32 = getPreviousPlayerData('gotCharm_32');
		this.gotCharm_32 = previousgotCharm_32 ? previousgotCharm_32.value : getDefaultPlayerDataValue('gotCharm_32');

		const previousgotCharm_33 = getPreviousPlayerData('gotCharm_33');
		this.gotCharm_33 = previousgotCharm_33 ? previousgotCharm_33.value : getDefaultPlayerDataValue('gotCharm_33');

		const previousgotCharm_34 = getPreviousPlayerData('gotCharm_34');
		this.gotCharm_34 = previousgotCharm_34 ? previousgotCharm_34.value : getDefaultPlayerDataValue('gotCharm_34');

		const previousgotCharm_35 = getPreviousPlayerData('gotCharm_35');
		this.gotCharm_35 = previousgotCharm_35 ? previousgotCharm_35.value : getDefaultPlayerDataValue('gotCharm_35');

		const previousgotCharm_36 = getPreviousPlayerData('gotCharm_36');
		this.gotCharm_36 = previousgotCharm_36 ? previousgotCharm_36.value : getDefaultPlayerDataValue('gotCharm_36');

		const previousgotCharm_37 = getPreviousPlayerData('gotCharm_37');
		this.gotCharm_37 = previousgotCharm_37 ? previousgotCharm_37.value : getDefaultPlayerDataValue('gotCharm_37');

		const previousgotCharm_38 = getPreviousPlayerData('gotCharm_38');
		this.gotCharm_38 = previousgotCharm_38 ? previousgotCharm_38.value : getDefaultPlayerDataValue('gotCharm_38');

		const previousgotCharm_39 = getPreviousPlayerData('gotCharm_39');
		this.gotCharm_39 = previousgotCharm_39 ? previousgotCharm_39.value : getDefaultPlayerDataValue('gotCharm_39');

		const previousgotCharm_40 = getPreviousPlayerData('gotCharm_40');
		this.gotCharm_40 = previousgotCharm_40 ? previousgotCharm_40.value : getDefaultPlayerDataValue('gotCharm_40');

		const previousroyalCharmState = getPreviousPlayerData('royalCharmState');
		this.royalCharmState = previousroyalCharmState
			? previousroyalCharmState.value
			: getDefaultPlayerDataValue('royalCharmState');

		const previousfragileHealth_unbreakable = getPreviousPlayerData('fragileHealth_unbreakable');
		this.fragileHealth_unbreakable = previousfragileHealth_unbreakable
			? previousfragileHealth_unbreakable.value
			: getDefaultPlayerDataValue('fragileHealth_unbreakable');

		const previousfragileStrength_unbreakable = getPreviousPlayerData('fragileStrength_unbreakable');
		this.fragileStrength_unbreakable = previousfragileStrength_unbreakable
			? previousfragileStrength_unbreakable.value
			: getDefaultPlayerDataValue('fragileStrength_unbreakable');

		const previousfragileGreed_unbreakable = getPreviousPlayerData('fragileGreed_unbreakable');
		this.fragileGreed_unbreakable = previousfragileGreed_unbreakable
			? previousfragileGreed_unbreakable.value
			: getDefaultPlayerDataValue('fragileGreed_unbreakable');

		const previousbrokenCharm_23 = getPreviousPlayerData('brokenCharm_23');
		this.brokenCharm_23 = previousbrokenCharm_23
			? previousbrokenCharm_23.value
			: getDefaultPlayerDataValue('brokenCharm_23');

		const previousbrokenCharm_24 = getPreviousPlayerData('brokenCharm_24');
		this.brokenCharm_24 = previousbrokenCharm_24
			? previousbrokenCharm_24.value
			: getDefaultPlayerDataValue('brokenCharm_24');

		const previousbrokenCharm_25 = getPreviousPlayerData('brokenCharm_25');
		this.brokenCharm_25 = previousbrokenCharm_25
			? previousbrokenCharm_25.value
			: getDefaultPlayerDataValue('brokenCharm_25');

		const previousgrimmChildLevel = getPreviousPlayerData('grimmChildLevel');
		this.grimmChildLevel = previousgrimmChildLevel
			? previousgrimmChildLevel.value
			: getDefaultPlayerDataValue('grimmChildLevel');

		const previouscompletionPercentage = getPreviousPlayerData('completionPercentage');
		this.completionPercentage = previouscompletionPercentage
			? previouscompletionPercentage.value
			: getDefaultPlayerDataValue('completionPercentage');

		const previousgrubsCollected = getPreviousPlayerData('grubsCollected');
		this.grubsCollected = previousgrubsCollected
			? previousgrubsCollected.value
			: getDefaultPlayerDataValue('grubsCollected');

		const previousgrubRewards = getPreviousPlayerData('grubRewards');
		this.grubRewards = previousgrubRewards ? previousgrubRewards.value : getDefaultPlayerDataValue('grubRewards');

		const previousHasXunFlower = getPreviousPlayerData('hasXunFlower');
		this.hasXunFlower = previousHasXunFlower
			? previousHasXunFlower.value
			: getDefaultPlayerDataValue('hasXunFlower');
		const previousXunFlowerBroken = getPreviousPlayerData('xunFlowerBroken');
		this.xunFlowerBroken = previousXunFlowerBroken
			? previousXunFlowerBroken.value
			: getDefaultPlayerDataValue('xunFlowerBroken');

		this.dead = getPreviousHeroState(heroStateFieldsHollow.byFieldName.dead)?.value ?? false;

		const previousShadeScene = getPreviousPlayerData('shadeScene');
		this.shadeScene = previousShadeScene ? previousShadeScene.value : getDefaultPlayerDataValue('shadeScene');

		const previousShadePositionX = getPreviousPlayerData('shadePositionX');
		this.shadePositionX = previousShadePositionX
			? previousShadePositionX.value
			: getDefaultPlayerDataValue('shadePositionX');
		const previousShadePositionY = getPreviousPlayerData('shadePositionY');
		this.shadePositionY = previousShadePositionY
			? previousShadePositionY.value
			: getDefaultPlayerDataValue('shadePositionY');

		const previousDreamGateScene = getPreviousPlayerData('dreamGateScene');
		this.dreamGateScene = previousDreamGateScene
			? previousDreamGateScene.value
			: getDefaultPlayerDataValue('dreamGateScene');
		const previousDreamGateX = getPreviousPlayerData('dreamGateX');
		this.dreamGateX = previousDreamGateX ? previousDreamGateX.value : getDefaultPlayerDataValue('dreamGateX');
		const previousDreamGateY = getPreviousPlayerData('dreamGateY');
		this.dreamGateY = previousDreamGateY ? previousDreamGateY.value : getDefaultPlayerDataValue('dreamGateY');

		// end auto generated from code above

		this.trinketGeo = this.trinket1 * 200 + this.trinket2 * 450 + this.trinket3 * 800 + this.trinket4 * 2000;
		this.geoTotal = this.geo + this.trinketGeo + this.geoPool;
		this.healthLost = this.maxHealth - this.health;

		this.grubsNoRewardCollected = this.grubsCollected - this.grubRewards;

		this.MPTotal = this.MPCharge + this.MPReserve;

		this.healthTotal = this.health + this.healthBlue;

		this.completionPercentageEarlyCalc = countGameCompletion(this);
	}
}

export type FrameEndEventNumberKeys = {
	[TField in keyof FrameEndEventHollow as FrameEndEventHollow[TField] extends number ? TField : never]: number;
};
export type FrameEndEventNumberKey = keyof FrameEndEventNumberKeys;
