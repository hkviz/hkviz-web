import { heroStateFields, type HeroStateField } from '../../hero-state/hero-states';
import { type BossSequenceDoorCompletion } from '../../player-data/boss-completion';
import {
	getDefaultValue as getDefaultPlayerDataValue,
	playerDataFieldsHollow,
	type PlayerDataField,
} from '../../player-data/player-data';
import { EventCreationContext } from '../events-shared/event-creation-context';
import { type PlayerPositionEvent } from '../events-shared/player-position-event';
import { RecordingEventBase } from '../events-shared/recording-event-base';
import { countGameCompletion } from '../parser-hollow/ingame-percentage';
import { HeroStateEvent } from './hero-state-event';
import { type PlayerDataEvent } from './player-data-event';

export const frameEndEventPlayerDataFieldsArray = [
	// geo
	playerDataFieldsHollow.byFieldName.geo,
	playerDataFieldsHollow.byFieldName.geoPool,
	playerDataFieldsHollow.byFieldName.trinket1,
	playerDataFieldsHollow.byFieldName.trinket2,
	playerDataFieldsHollow.byFieldName.trinket3,
	playerDataFieldsHollow.byFieldName.trinket4,

	// health
	playerDataFieldsHollow.byFieldName.health,
	playerDataFieldsHollow.byFieldName.maxHealth,
	playerDataFieldsHollow.byFieldName.healthBlue,

	// soul
	playerDataFieldsHollow.byFieldName.MPCharge,
	playerDataFieldsHollow.byFieldName.MPReserve,

	// percentage
	playerDataFieldsHollow.byFieldName.killedFalseKnight,
	playerDataFieldsHollow.byFieldName.hornet1Defeated,
	playerDataFieldsHollow.byFieldName.hornetOutskirtsDefeated,
	playerDataFieldsHollow.byFieldName.killedMantisLord,
	playerDataFieldsHollow.byFieldName.killedMageLord,
	playerDataFieldsHollow.byFieldName.killedDungDefender,
	playerDataFieldsHollow.byFieldName.killedBlackKnight,
	playerDataFieldsHollow.byFieldName.killedInfectedKnight,
	playerDataFieldsHollow.byFieldName.killedMimicSpider,
	playerDataFieldsHollow.byFieldName.killedMegaJellyfish,
	playerDataFieldsHollow.byFieldName.killedTraitorLord,
	playerDataFieldsHollow.byFieldName.killedJarCollector,
	playerDataFieldsHollow.byFieldName.killedBigFly,
	playerDataFieldsHollow.byFieldName.killedMawlek,
	playerDataFieldsHollow.byFieldName.killedHiveKnight,
	playerDataFieldsHollow.byFieldName.colosseumBronzeCompleted,
	playerDataFieldsHollow.byFieldName.colosseumSilverCompleted,
	playerDataFieldsHollow.byFieldName.colosseumGoldCompleted,
	playerDataFieldsHollow.byFieldName.killedGhostAladar,
	playerDataFieldsHollow.byFieldName.killedGhostHu,
	playerDataFieldsHollow.byFieldName.killedGhostXero,
	playerDataFieldsHollow.byFieldName.killedGhostMarkoth,
	playerDataFieldsHollow.byFieldName.killedGhostNoEyes,
	playerDataFieldsHollow.byFieldName.killedGhostMarmu,
	playerDataFieldsHollow.byFieldName.killedGhostGalien,
	playerDataFieldsHollow.byFieldName.fireballLevel,
	playerDataFieldsHollow.byFieldName.quakeLevel,
	playerDataFieldsHollow.byFieldName.screamLevel,
	playerDataFieldsHollow.byFieldName.hasCyclone,
	playerDataFieldsHollow.byFieldName.hasDashSlash,
	playerDataFieldsHollow.byFieldName.hasUpwardSlash,
	playerDataFieldsHollow.byFieldName.hasDash,
	playerDataFieldsHollow.byFieldName.hasWalljump,
	playerDataFieldsHollow.byFieldName.hasDoubleJump,
	playerDataFieldsHollow.byFieldName.hasAcidArmour,
	playerDataFieldsHollow.byFieldName.hasSuperDash,
	playerDataFieldsHollow.byFieldName.hasShadowDash,
	playerDataFieldsHollow.byFieldName.hasKingsBrand,
	playerDataFieldsHollow.byFieldName.lurienDefeated,
	playerDataFieldsHollow.byFieldName.hegemolDefeated,
	playerDataFieldsHollow.byFieldName.monomonDefeated,
	playerDataFieldsHollow.byFieldName.hasDreamNail,
	playerDataFieldsHollow.byFieldName.dreamOrbs,
	playerDataFieldsHollow.byFieldName.dreamNailUpgraded,
	playerDataFieldsHollow.byFieldName.mothDeparted,
	playerDataFieldsHollow.byFieldName.nailSmithUpgrades,
	playerDataFieldsHollow.byFieldName.maxHealthBase,
	playerDataFieldsHollow.byFieldName.MPReserveMax,
	playerDataFieldsHollow.byFieldName.killedGrimm,
	playerDataFieldsHollow.byFieldName.killedNightmareGrimm,
	playerDataFieldsHollow.byFieldName.destroyedNightmareLantern,
	playerDataFieldsHollow.byFieldName.hasGodfinder,
	playerDataFieldsHollow.byFieldName.bossDoorStateTier1,
	playerDataFieldsHollow.byFieldName.bossDoorStateTier2,
	playerDataFieldsHollow.byFieldName.bossDoorStateTier3,
	playerDataFieldsHollow.byFieldName.bossDoorStateTier4,

	// charms
	playerDataFieldsHollow.byFieldName.gotCharm_1,
	playerDataFieldsHollow.byFieldName.gotCharm_2,
	playerDataFieldsHollow.byFieldName.gotCharm_3,
	playerDataFieldsHollow.byFieldName.gotCharm_4,
	playerDataFieldsHollow.byFieldName.gotCharm_5,
	playerDataFieldsHollow.byFieldName.gotCharm_6,
	playerDataFieldsHollow.byFieldName.gotCharm_7,
	playerDataFieldsHollow.byFieldName.gotCharm_8,
	playerDataFieldsHollow.byFieldName.gotCharm_9,
	playerDataFieldsHollow.byFieldName.gotCharm_10,
	playerDataFieldsHollow.byFieldName.gotCharm_11,
	playerDataFieldsHollow.byFieldName.gotCharm_12,
	playerDataFieldsHollow.byFieldName.gotCharm_13,
	playerDataFieldsHollow.byFieldName.gotCharm_14,
	playerDataFieldsHollow.byFieldName.gotCharm_15,
	playerDataFieldsHollow.byFieldName.gotCharm_16,
	playerDataFieldsHollow.byFieldName.gotCharm_17,
	playerDataFieldsHollow.byFieldName.gotCharm_18,
	playerDataFieldsHollow.byFieldName.gotCharm_19,
	playerDataFieldsHollow.byFieldName.gotCharm_20,
	playerDataFieldsHollow.byFieldName.gotCharm_21,
	playerDataFieldsHollow.byFieldName.gotCharm_22,
	playerDataFieldsHollow.byFieldName.gotCharm_23,
	playerDataFieldsHollow.byFieldName.gotCharm_24,
	playerDataFieldsHollow.byFieldName.gotCharm_25,
	playerDataFieldsHollow.byFieldName.gotCharm_26,
	playerDataFieldsHollow.byFieldName.gotCharm_27,
	playerDataFieldsHollow.byFieldName.gotCharm_28,
	playerDataFieldsHollow.byFieldName.gotCharm_29,
	playerDataFieldsHollow.byFieldName.gotCharm_30,
	playerDataFieldsHollow.byFieldName.gotCharm_31,
	playerDataFieldsHollow.byFieldName.gotCharm_32,
	playerDataFieldsHollow.byFieldName.gotCharm_33,
	playerDataFieldsHollow.byFieldName.gotCharm_34,
	playerDataFieldsHollow.byFieldName.gotCharm_35,
	playerDataFieldsHollow.byFieldName.gotCharm_36,
	playerDataFieldsHollow.byFieldName.gotCharm_37,
	playerDataFieldsHollow.byFieldName.gotCharm_38,
	playerDataFieldsHollow.byFieldName.gotCharm_39,
	playerDataFieldsHollow.byFieldName.gotCharm_40,
	playerDataFieldsHollow.byFieldName.royalCharmState,

	playerDataFieldsHollow.byFieldName.fragileHealth_unbreakable,
	playerDataFieldsHollow.byFieldName.fragileStrength_unbreakable,
	playerDataFieldsHollow.byFieldName.fragileGreed_unbreakable,
	playerDataFieldsHollow.byFieldName.brokenCharm_23,
	playerDataFieldsHollow.byFieldName.brokenCharm_24,
	playerDataFieldsHollow.byFieldName.brokenCharm_25,
	playerDataFieldsHollow.byFieldName.grimmChildLevel,

	playerDataFieldsHollow.byFieldName.completionPercentage,

	// grubs
	playerDataFieldsHollow.byFieldName.grubsCollected,
	playerDataFieldsHollow.byFieldName.grubRewards,

	// flower
	playerDataFieldsHollow.byFieldName.hasXunFlower,
	playerDataFieldsHollow.byFieldName.xunFlowerBroken,

	// shade
	playerDataFieldsHollow.byFieldName.shadeScene,
	playerDataFieldsHollow.byFieldName.shadePositionX,
	playerDataFieldsHollow.byFieldName.shadePositionY,

	// dreamgate
	playerDataFieldsHollow.byFieldName.dreamGateScene,
	playerDataFieldsHollow.byFieldName.dreamGateX,
	playerDataFieldsHollow.byFieldName.dreamGateY,
] as const;
export const frameEndEventPlayerDataFields = new Set<PlayerDataField>(frameEndEventPlayerDataFieldsArray);

type FrameEndEventPlayerDataField = (typeof frameEndEventPlayerDataFieldsArray)[number];

export const frameEndHeroStateFieldsArray = [heroStateFields.byFieldName.dead] as const;

export const frameEndEventHeroStateFields = new Set<HeroStateField>(frameEndHeroStateFieldsArray);

type FrameEndEventHeroStateField = (typeof frameEndHeroStateFieldsArray)[number];

type FrameEndBase = {
	[TField in FrameEndEventHeroStateField as TField['name']]: boolean;
} & {
	[TField in FrameEndEventPlayerDataField as TField['name']]: PlayerDataEvent<TField>['value'];
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

export class FrameEndEventHollow extends RecordingEventBase implements FrameEndBase {
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
		getPreviousPlayerData: <TField extends PlayerDataField>(field: TField) => PlayerDataEvent<TField> | undefined,
		getPreviousHeroState: (field: HeroStateField) => HeroStateEvent | undefined,
		ctx: EventCreationContext,
	) {
		super(ctx);

		this.previousFrameEndEvent = previousFrameEndEvent;
		this.previousPlayerPositionEvent = previousPlayerPositionEvent;

		// start auto generated from code above
		// meta programming sadly produced a properties array for each instance, which is not acceptable
		// for this object as it is instantiated very often

		const previousgeo = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.geo);
		this.geo = previousgeo ? previousgeo.value : getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.geo);

		const previousgeoPool = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.geoPool);
		this.geoPool = previousgeoPool
			? previousgeoPool.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.geoPool);

		const previoustrinket1 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.trinket1);
		this.trinket1 = previoustrinket1
			? previoustrinket1.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.trinket1);

		const previoustrinket2 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.trinket2);
		this.trinket2 = previoustrinket2
			? previoustrinket2.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.trinket2);

		const previoustrinket3 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.trinket3);
		this.trinket3 = previoustrinket3
			? previoustrinket3.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.trinket3);

		const previoustrinket4 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.trinket4);
		this.trinket4 = previoustrinket4
			? previoustrinket4.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.trinket4);

		const previoushealth = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.health);
		this.health = previoushealth
			? previoushealth.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.health);

		const previousmaxHealth = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.maxHealth);
		this.maxHealth = previousmaxHealth
			? previousmaxHealth.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.maxHealth);

		const previoushealthBlue = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.healthBlue);
		this.healthBlue = previoushealthBlue
			? previoushealthBlue.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.healthBlue);

		const previousMPCharge = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.MPCharge);
		this.MPCharge = previousMPCharge
			? previousMPCharge.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.MPCharge);

		const previousMPReserve = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.MPReserve);
		this.MPReserve = previousMPReserve
			? previousMPReserve.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.MPReserve);

		const previouskilledFalseKnight = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.killedFalseKnight);
		this.killedFalseKnight = previouskilledFalseKnight
			? previouskilledFalseKnight.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.killedFalseKnight);

		const previoushornet1Defeated = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.hornet1Defeated);
		this.hornet1Defeated = previoushornet1Defeated
			? previoushornet1Defeated.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.hornet1Defeated);

		const previoushornetOutskirtsDefeated = getPreviousPlayerData(
			playerDataFieldsHollow.byFieldName.hornetOutskirtsDefeated,
		);
		this.hornetOutskirtsDefeated = previoushornetOutskirtsDefeated
			? previoushornetOutskirtsDefeated.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.hornetOutskirtsDefeated);

		const previouskilledMantisLord = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.killedMantisLord);
		this.killedMantisLord = previouskilledMantisLord
			? previouskilledMantisLord.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.killedMantisLord);

		const previouskilledMageLord = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.killedMageLord);
		this.killedMageLord = previouskilledMageLord
			? previouskilledMageLord.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.killedMageLord);

		const previouskilledDungDefender = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.killedDungDefender);
		this.killedDungDefender = previouskilledDungDefender
			? previouskilledDungDefender.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.killedDungDefender);

		const previouskilledBlackKnight = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.killedBlackKnight);
		this.killedBlackKnight = previouskilledBlackKnight
			? previouskilledBlackKnight.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.killedBlackKnight);

		const previouskilledInfectedKnight = getPreviousPlayerData(
			playerDataFieldsHollow.byFieldName.killedInfectedKnight,
		);
		this.killedInfectedKnight = previouskilledInfectedKnight
			? previouskilledInfectedKnight.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.killedInfectedKnight);

		const previouskilledMimicSpider = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.killedMimicSpider);
		this.killedMimicSpider = previouskilledMimicSpider
			? previouskilledMimicSpider.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.killedMimicSpider);

		const previouskilledMegaJellyfish = getPreviousPlayerData(
			playerDataFieldsHollow.byFieldName.killedMegaJellyfish,
		);
		this.killedMegaJellyfish = previouskilledMegaJellyfish
			? previouskilledMegaJellyfish.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.killedMegaJellyfish);

		const previouskilledTraitorLord = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.killedTraitorLord);
		this.killedTraitorLord = previouskilledTraitorLord
			? previouskilledTraitorLord.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.killedTraitorLord);

		const previouskilledJarCollector = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.killedJarCollector);
		this.killedJarCollector = previouskilledJarCollector
			? previouskilledJarCollector.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.killedJarCollector);

		const previouskilledBigFly = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.killedBigFly);
		this.killedBigFly = previouskilledBigFly
			? previouskilledBigFly.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.killedBigFly);

		const previouskilledMawlek = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.killedMawlek);
		this.killedMawlek = previouskilledMawlek
			? previouskilledMawlek.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.killedMawlek);

		const previouskilledHiveKnight = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.killedHiveKnight);
		this.killedHiveKnight = previouskilledHiveKnight
			? previouskilledHiveKnight.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.killedHiveKnight);

		const previouscolosseumBronzeCompleted = getPreviousPlayerData(
			playerDataFieldsHollow.byFieldName.colosseumBronzeCompleted,
		);
		this.colosseumBronzeCompleted = previouscolosseumBronzeCompleted
			? previouscolosseumBronzeCompleted.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.colosseumBronzeCompleted);

		const previouscolosseumSilverCompleted = getPreviousPlayerData(
			playerDataFieldsHollow.byFieldName.colosseumSilverCompleted,
		);
		this.colosseumSilverCompleted = previouscolosseumSilverCompleted
			? previouscolosseumSilverCompleted.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.colosseumSilverCompleted);

		const previouscolosseumGoldCompleted = getPreviousPlayerData(
			playerDataFieldsHollow.byFieldName.colosseumGoldCompleted,
		);
		this.colosseumGoldCompleted = previouscolosseumGoldCompleted
			? previouscolosseumGoldCompleted.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.colosseumGoldCompleted);

		const previouskilledGhostAladar = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.killedGhostAladar);
		this.killedGhostAladar = previouskilledGhostAladar
			? previouskilledGhostAladar.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.killedGhostAladar);

		const previouskilledGhostHu = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.killedGhostHu);
		this.killedGhostHu = previouskilledGhostHu
			? previouskilledGhostHu.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.killedGhostHu);

		const previouskilledGhostXero = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.killedGhostXero);
		this.killedGhostXero = previouskilledGhostXero
			? previouskilledGhostXero.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.killedGhostXero);

		const previouskilledGhostMarkoth = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.killedGhostMarkoth);
		this.killedGhostMarkoth = previouskilledGhostMarkoth
			? previouskilledGhostMarkoth.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.killedGhostMarkoth);

		const previouskilledGhostNoEyes = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.killedGhostNoEyes);
		this.killedGhostNoEyes = previouskilledGhostNoEyes
			? previouskilledGhostNoEyes.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.killedGhostNoEyes);

		const previouskilledGhostMarmu = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.killedGhostMarmu);
		this.killedGhostMarmu = previouskilledGhostMarmu
			? previouskilledGhostMarmu.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.killedGhostMarmu);

		const previouskilledGhostGalien = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.killedGhostGalien);
		this.killedGhostGalien = previouskilledGhostGalien
			? previouskilledGhostGalien.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.killedGhostGalien);

		const previousfireballLevel = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.fireballLevel);
		this.fireballLevel = previousfireballLevel
			? previousfireballLevel.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.fireballLevel);

		const previousquakeLevel = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.quakeLevel);
		this.quakeLevel = previousquakeLevel
			? previousquakeLevel.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.quakeLevel);

		const previousscreamLevel = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.screamLevel);
		this.screamLevel = previousscreamLevel
			? previousscreamLevel.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.screamLevel);

		const previoushasCyclone = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.hasCyclone);
		this.hasCyclone = previoushasCyclone
			? previoushasCyclone.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.hasCyclone);

		const previoushasDashSlash = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.hasDashSlash);
		this.hasDashSlash = previoushasDashSlash
			? previoushasDashSlash.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.hasDashSlash);

		const previoushasUpwardSlash = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.hasUpwardSlash);
		this.hasUpwardSlash = previoushasUpwardSlash
			? previoushasUpwardSlash.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.hasUpwardSlash);

		const previoushasDash = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.hasDash);
		this.hasDash = previoushasDash
			? previoushasDash.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.hasDash);

		const previoushasWalljump = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.hasWalljump);
		this.hasWalljump = previoushasWalljump
			? previoushasWalljump.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.hasWalljump);

		const previoushasDoubleJump = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.hasDoubleJump);
		this.hasDoubleJump = previoushasDoubleJump
			? previoushasDoubleJump.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.hasDoubleJump);

		const previoushasAcidArmour = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.hasAcidArmour);
		this.hasAcidArmour = previoushasAcidArmour
			? previoushasAcidArmour.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.hasAcidArmour);

		const previoushasSuperDash = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.hasSuperDash);
		this.hasSuperDash = previoushasSuperDash
			? previoushasSuperDash.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.hasSuperDash);

		const previoushasShadowDash = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.hasShadowDash);
		this.hasShadowDash = previoushasShadowDash
			? previoushasShadowDash.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.hasShadowDash);

		const previoushasKingsBrand = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.hasKingsBrand);
		this.hasKingsBrand = previoushasKingsBrand
			? previoushasKingsBrand.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.hasKingsBrand);

		const previouslurienDefeated = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.lurienDefeated);
		this.lurienDefeated = previouslurienDefeated
			? previouslurienDefeated.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.lurienDefeated);

		const previoushegemolDefeated = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.hegemolDefeated);
		this.hegemolDefeated = previoushegemolDefeated
			? previoushegemolDefeated.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.hegemolDefeated);

		const previousmonomonDefeated = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.monomonDefeated);
		this.monomonDefeated = previousmonomonDefeated
			? previousmonomonDefeated.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.monomonDefeated);

		const previoushasDreamNail = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.hasDreamNail);
		this.hasDreamNail = previoushasDreamNail
			? previoushasDreamNail.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.hasDreamNail);

		const previousdreamNailUpgraded = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.dreamNailUpgraded);
		this.dreamNailUpgraded = previousdreamNailUpgraded
			? previousdreamNailUpgraded.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.dreamNailUpgraded);

		const previousdreamOrbs = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.dreamOrbs);
		this.dreamOrbs = previousdreamOrbs
			? previousdreamOrbs.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.dreamOrbs);

		const previousmothDeparted = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.mothDeparted);
		this.mothDeparted = previousmothDeparted
			? previousmothDeparted.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.mothDeparted);

		const previousnailSmithUpgrades = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.nailSmithUpgrades);
		this.nailSmithUpgrades = previousnailSmithUpgrades
			? previousnailSmithUpgrades.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.nailSmithUpgrades);

		const previousmaxHealthBase = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.maxHealthBase);
		this.maxHealthBase = previousmaxHealthBase
			? previousmaxHealthBase.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.maxHealthBase);

		const previousMPReserveMax = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.MPReserveMax);
		this.MPReserveMax = previousMPReserveMax
			? previousMPReserveMax.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.MPReserveMax);

		const previouskilledGrimm = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.killedGrimm);
		this.killedGrimm = previouskilledGrimm
			? previouskilledGrimm.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.killedGrimm);

		const previouskilledNightmareGrimm = getPreviousPlayerData(
			playerDataFieldsHollow.byFieldName.killedNightmareGrimm,
		);
		this.killedNightmareGrimm = previouskilledNightmareGrimm
			? previouskilledNightmareGrimm.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.killedNightmareGrimm);

		const previousdestroyedNightmareLantern = getPreviousPlayerData(
			playerDataFieldsHollow.byFieldName.destroyedNightmareLantern,
		);
		this.destroyedNightmareLantern = previousdestroyedNightmareLantern
			? previousdestroyedNightmareLantern.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.destroyedNightmareLantern);

		const previoushasGodfinder = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.hasGodfinder);
		this.hasGodfinder = previoushasGodfinder
			? previoushasGodfinder.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.hasGodfinder);

		const previousbossDoorStateTier1 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.bossDoorStateTier1);
		this.bossDoorStateTier1 = previousbossDoorStateTier1
			? previousbossDoorStateTier1.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.bossDoorStateTier1);

		const previousbossDoorStateTier2 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.bossDoorStateTier2);
		this.bossDoorStateTier2 = previousbossDoorStateTier2
			? previousbossDoorStateTier2.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.bossDoorStateTier2);

		const previousbossDoorStateTier3 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.bossDoorStateTier3);
		this.bossDoorStateTier3 = previousbossDoorStateTier3
			? previousbossDoorStateTier3.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.bossDoorStateTier3);

		const previousbossDoorStateTier4 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.bossDoorStateTier4);
		this.bossDoorStateTier4 = previousbossDoorStateTier4
			? previousbossDoorStateTier4.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.bossDoorStateTier4);

		const previousgotCharm_1 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_1);
		this.gotCharm_1 = previousgotCharm_1
			? previousgotCharm_1.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_1);

		const previousgotCharm_2 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_2);
		this.gotCharm_2 = previousgotCharm_2
			? previousgotCharm_2.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_2);

		const previousgotCharm_3 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_3);
		this.gotCharm_3 = previousgotCharm_3
			? previousgotCharm_3.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_3);

		const previousgotCharm_4 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_4);
		this.gotCharm_4 = previousgotCharm_4
			? previousgotCharm_4.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_4);

		const previousgotCharm_5 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_5);
		this.gotCharm_5 = previousgotCharm_5
			? previousgotCharm_5.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_5);

		const previousgotCharm_6 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_6);
		this.gotCharm_6 = previousgotCharm_6
			? previousgotCharm_6.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_6);

		const previousgotCharm_7 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_7);
		this.gotCharm_7 = previousgotCharm_7
			? previousgotCharm_7.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_7);

		const previousgotCharm_8 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_8);
		this.gotCharm_8 = previousgotCharm_8
			? previousgotCharm_8.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_8);

		const previousgotCharm_9 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_9);
		this.gotCharm_9 = previousgotCharm_9
			? previousgotCharm_9.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_9);

		const previousgotCharm_10 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_10);
		this.gotCharm_10 = previousgotCharm_10
			? previousgotCharm_10.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_10);

		const previousgotCharm_11 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_11);
		this.gotCharm_11 = previousgotCharm_11
			? previousgotCharm_11.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_11);

		const previousgotCharm_12 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_12);
		this.gotCharm_12 = previousgotCharm_12
			? previousgotCharm_12.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_12);

		const previousgotCharm_13 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_13);
		this.gotCharm_13 = previousgotCharm_13
			? previousgotCharm_13.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_13);

		const previousgotCharm_14 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_14);
		this.gotCharm_14 = previousgotCharm_14
			? previousgotCharm_14.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_14);

		const previousgotCharm_15 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_15);
		this.gotCharm_15 = previousgotCharm_15
			? previousgotCharm_15.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_15);

		const previousgotCharm_16 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_16);
		this.gotCharm_16 = previousgotCharm_16
			? previousgotCharm_16.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_16);

		const previousgotCharm_17 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_17);
		this.gotCharm_17 = previousgotCharm_17
			? previousgotCharm_17.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_17);

		const previousgotCharm_18 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_18);
		this.gotCharm_18 = previousgotCharm_18
			? previousgotCharm_18.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_18);

		const previousgotCharm_19 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_19);
		this.gotCharm_19 = previousgotCharm_19
			? previousgotCharm_19.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_19);

		const previousgotCharm_20 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_20);
		this.gotCharm_20 = previousgotCharm_20
			? previousgotCharm_20.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_20);

		const previousgotCharm_21 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_21);
		this.gotCharm_21 = previousgotCharm_21
			? previousgotCharm_21.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_21);

		const previousgotCharm_22 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_22);
		this.gotCharm_22 = previousgotCharm_22
			? previousgotCharm_22.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_22);

		const previousgotCharm_23 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_23);
		this.gotCharm_23 = previousgotCharm_23
			? previousgotCharm_23.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_23);

		const previousgotCharm_24 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_24);
		this.gotCharm_24 = previousgotCharm_24
			? previousgotCharm_24.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_24);

		const previousgotCharm_25 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_25);
		this.gotCharm_25 = previousgotCharm_25
			? previousgotCharm_25.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_25);

		const previousgotCharm_26 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_26);
		this.gotCharm_26 = previousgotCharm_26
			? previousgotCharm_26.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_26);

		const previousgotCharm_27 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_27);
		this.gotCharm_27 = previousgotCharm_27
			? previousgotCharm_27.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_27);

		const previousgotCharm_28 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_28);
		this.gotCharm_28 = previousgotCharm_28
			? previousgotCharm_28.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_28);

		const previousgotCharm_29 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_29);
		this.gotCharm_29 = previousgotCharm_29
			? previousgotCharm_29.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_29);

		const previousgotCharm_30 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_30);
		this.gotCharm_30 = previousgotCharm_30
			? previousgotCharm_30.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_30);

		const previousgotCharm_31 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_31);
		this.gotCharm_31 = previousgotCharm_31
			? previousgotCharm_31.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_31);

		const previousgotCharm_32 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_32);
		this.gotCharm_32 = previousgotCharm_32
			? previousgotCharm_32.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_32);

		const previousgotCharm_33 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_33);
		this.gotCharm_33 = previousgotCharm_33
			? previousgotCharm_33.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_33);

		const previousgotCharm_34 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_34);
		this.gotCharm_34 = previousgotCharm_34
			? previousgotCharm_34.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_34);

		const previousgotCharm_35 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_35);
		this.gotCharm_35 = previousgotCharm_35
			? previousgotCharm_35.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_35);

		const previousgotCharm_36 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_36);
		this.gotCharm_36 = previousgotCharm_36
			? previousgotCharm_36.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_36);

		const previousgotCharm_37 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_37);
		this.gotCharm_37 = previousgotCharm_37
			? previousgotCharm_37.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_37);

		const previousgotCharm_38 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_38);
		this.gotCharm_38 = previousgotCharm_38
			? previousgotCharm_38.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_38);

		const previousgotCharm_39 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_39);
		this.gotCharm_39 = previousgotCharm_39
			? previousgotCharm_39.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_39);

		const previousgotCharm_40 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.gotCharm_40);
		this.gotCharm_40 = previousgotCharm_40
			? previousgotCharm_40.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.gotCharm_40);

		const previousroyalCharmState = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.royalCharmState);
		this.royalCharmState = previousroyalCharmState
			? previousroyalCharmState.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.royalCharmState);

		const previousfragileHealth_unbreakable = getPreviousPlayerData(
			playerDataFieldsHollow.byFieldName.fragileHealth_unbreakable,
		);
		this.fragileHealth_unbreakable = previousfragileHealth_unbreakable
			? previousfragileHealth_unbreakable.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.fragileHealth_unbreakable);

		const previousfragileStrength_unbreakable = getPreviousPlayerData(
			playerDataFieldsHollow.byFieldName.fragileStrength_unbreakable,
		);
		this.fragileStrength_unbreakable = previousfragileStrength_unbreakable
			? previousfragileStrength_unbreakable.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.fragileStrength_unbreakable);

		const previousfragileGreed_unbreakable = getPreviousPlayerData(
			playerDataFieldsHollow.byFieldName.fragileGreed_unbreakable,
		);
		this.fragileGreed_unbreakable = previousfragileGreed_unbreakable
			? previousfragileGreed_unbreakable.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.fragileGreed_unbreakable);

		const previousbrokenCharm_23 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.brokenCharm_23);
		this.brokenCharm_23 = previousbrokenCharm_23
			? previousbrokenCharm_23.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.brokenCharm_23);

		const previousbrokenCharm_24 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.brokenCharm_24);
		this.brokenCharm_24 = previousbrokenCharm_24
			? previousbrokenCharm_24.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.brokenCharm_24);

		const previousbrokenCharm_25 = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.brokenCharm_25);
		this.brokenCharm_25 = previousbrokenCharm_25
			? previousbrokenCharm_25.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.brokenCharm_25);

		const previousgrimmChildLevel = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.grimmChildLevel);
		this.grimmChildLevel = previousgrimmChildLevel
			? previousgrimmChildLevel.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.grimmChildLevel);

		const previouscompletionPercentage = getPreviousPlayerData(
			playerDataFieldsHollow.byFieldName.completionPercentage,
		);
		this.completionPercentage = previouscompletionPercentage
			? previouscompletionPercentage.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.completionPercentage);

		const previousgrubsCollected = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.grubsCollected);
		this.grubsCollected = previousgrubsCollected
			? previousgrubsCollected.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.grubsCollected);

		const previousgrubRewards = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.grubRewards);
		this.grubRewards = previousgrubRewards
			? previousgrubRewards.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.grubRewards);

		const previousHasXunFlower = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.hasXunFlower);
		this.hasXunFlower = previousHasXunFlower
			? previousHasXunFlower.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.hasXunFlower);
		const previousXunFlowerBroken = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.xunFlowerBroken);
		this.xunFlowerBroken = previousXunFlowerBroken
			? previousXunFlowerBroken.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.xunFlowerBroken);

		this.dead = getPreviousHeroState(heroStateFields.byFieldName.dead)?.value ?? false;

		const previousShadeScene = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.shadeScene);
		this.shadeScene = previousShadeScene
			? previousShadeScene.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.shadeScene);

		const previousShadePositionX = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.shadePositionX);
		this.shadePositionX = previousShadePositionX
			? previousShadePositionX.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.shadePositionX);
		const previousShadePositionY = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.shadePositionY);
		this.shadePositionY = previousShadePositionY
			? previousShadePositionY.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.shadePositionY);

		const previousDreamGateScene = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.dreamGateScene);
		this.dreamGateScene = previousDreamGateScene
			? previousDreamGateScene.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.dreamGateScene);
		const previousDreamGateX = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.dreamGateX);
		this.dreamGateX = previousDreamGateX
			? previousDreamGateX.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.dreamGateX);
		const previousDreamGateY = getPreviousPlayerData(playerDataFieldsHollow.byFieldName.dreamGateY);
		this.dreamGateY = previousDreamGateY
			? previousDreamGateY.value
			: getDefaultPlayerDataValue(playerDataFieldsHollow.byFieldName.dreamGateY);

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
