import { heroStateFields, type HeroStateField } from '../../hero-state/hero-states';
import { type BossSequenceDoorCompletion } from '../../player-data/boss-completion';
import {
	getDefaultValue as getDefaultPlayerDataValue,
	playerDataFields,
	type PlayerDataField,
} from '../../player-data/player-data';
import { EventCreationContext } from '../events-shared/event-creation-context';
import { RecordingEventBase } from '../events-shared/recording-event-base';
import { countGameCompletion } from '../ingame-percentage';
import { HeroStateEvent } from './hero-state-event';
import { type PlayerDataEvent } from './player-data-event';
import { type PlayerPositionEvent } from './player-position-event';

export const frameEndEventPlayerDataFieldsArray = [
	// geo
	playerDataFields.byFieldName.geo,
	playerDataFields.byFieldName.geoPool,
	playerDataFields.byFieldName.trinket1,
	playerDataFields.byFieldName.trinket2,
	playerDataFields.byFieldName.trinket3,
	playerDataFields.byFieldName.trinket4,

	// health
	playerDataFields.byFieldName.health,
	playerDataFields.byFieldName.maxHealth,
	playerDataFields.byFieldName.healthBlue,

	// soul
	playerDataFields.byFieldName.MPCharge,
	playerDataFields.byFieldName.MPReserve,

	// percentage
	playerDataFields.byFieldName.killedFalseKnight,
	playerDataFields.byFieldName.hornet1Defeated,
	playerDataFields.byFieldName.hornetOutskirtsDefeated,
	playerDataFields.byFieldName.killedMantisLord,
	playerDataFields.byFieldName.killedMageLord,
	playerDataFields.byFieldName.killedDungDefender,
	playerDataFields.byFieldName.killedBlackKnight,
	playerDataFields.byFieldName.killedInfectedKnight,
	playerDataFields.byFieldName.killedMimicSpider,
	playerDataFields.byFieldName.killedMegaJellyfish,
	playerDataFields.byFieldName.killedTraitorLord,
	playerDataFields.byFieldName.killedJarCollector,
	playerDataFields.byFieldName.killedBigFly,
	playerDataFields.byFieldName.killedMawlek,
	playerDataFields.byFieldName.killedHiveKnight,
	playerDataFields.byFieldName.colosseumBronzeCompleted,
	playerDataFields.byFieldName.colosseumSilverCompleted,
	playerDataFields.byFieldName.colosseumGoldCompleted,
	playerDataFields.byFieldName.killedGhostAladar,
	playerDataFields.byFieldName.killedGhostHu,
	playerDataFields.byFieldName.killedGhostXero,
	playerDataFields.byFieldName.killedGhostMarkoth,
	playerDataFields.byFieldName.killedGhostNoEyes,
	playerDataFields.byFieldName.killedGhostMarmu,
	playerDataFields.byFieldName.killedGhostGalien,
	playerDataFields.byFieldName.fireballLevel,
	playerDataFields.byFieldName.quakeLevel,
	playerDataFields.byFieldName.screamLevel,
	playerDataFields.byFieldName.hasCyclone,
	playerDataFields.byFieldName.hasDashSlash,
	playerDataFields.byFieldName.hasUpwardSlash,
	playerDataFields.byFieldName.hasDash,
	playerDataFields.byFieldName.hasWalljump,
	playerDataFields.byFieldName.hasDoubleJump,
	playerDataFields.byFieldName.hasAcidArmour,
	playerDataFields.byFieldName.hasSuperDash,
	playerDataFields.byFieldName.hasShadowDash,
	playerDataFields.byFieldName.hasKingsBrand,
	playerDataFields.byFieldName.lurienDefeated,
	playerDataFields.byFieldName.hegemolDefeated,
	playerDataFields.byFieldName.monomonDefeated,
	playerDataFields.byFieldName.hasDreamNail,
	playerDataFields.byFieldName.dreamOrbs,
	playerDataFields.byFieldName.dreamNailUpgraded,
	playerDataFields.byFieldName.mothDeparted,
	playerDataFields.byFieldName.nailSmithUpgrades,
	playerDataFields.byFieldName.maxHealthBase,
	playerDataFields.byFieldName.MPReserveMax,
	playerDataFields.byFieldName.killedGrimm,
	playerDataFields.byFieldName.killedNightmareGrimm,
	playerDataFields.byFieldName.destroyedNightmareLantern,
	playerDataFields.byFieldName.hasGodfinder,
	playerDataFields.byFieldName.bossDoorStateTier1,
	playerDataFields.byFieldName.bossDoorStateTier2,
	playerDataFields.byFieldName.bossDoorStateTier3,
	playerDataFields.byFieldName.bossDoorStateTier4,

	// charms
	playerDataFields.byFieldName.gotCharm_1,
	playerDataFields.byFieldName.gotCharm_2,
	playerDataFields.byFieldName.gotCharm_3,
	playerDataFields.byFieldName.gotCharm_4,
	playerDataFields.byFieldName.gotCharm_5,
	playerDataFields.byFieldName.gotCharm_6,
	playerDataFields.byFieldName.gotCharm_7,
	playerDataFields.byFieldName.gotCharm_8,
	playerDataFields.byFieldName.gotCharm_9,
	playerDataFields.byFieldName.gotCharm_10,
	playerDataFields.byFieldName.gotCharm_11,
	playerDataFields.byFieldName.gotCharm_12,
	playerDataFields.byFieldName.gotCharm_13,
	playerDataFields.byFieldName.gotCharm_14,
	playerDataFields.byFieldName.gotCharm_15,
	playerDataFields.byFieldName.gotCharm_16,
	playerDataFields.byFieldName.gotCharm_17,
	playerDataFields.byFieldName.gotCharm_18,
	playerDataFields.byFieldName.gotCharm_19,
	playerDataFields.byFieldName.gotCharm_20,
	playerDataFields.byFieldName.gotCharm_21,
	playerDataFields.byFieldName.gotCharm_22,
	playerDataFields.byFieldName.gotCharm_23,
	playerDataFields.byFieldName.gotCharm_24,
	playerDataFields.byFieldName.gotCharm_25,
	playerDataFields.byFieldName.gotCharm_26,
	playerDataFields.byFieldName.gotCharm_27,
	playerDataFields.byFieldName.gotCharm_28,
	playerDataFields.byFieldName.gotCharm_29,
	playerDataFields.byFieldName.gotCharm_30,
	playerDataFields.byFieldName.gotCharm_31,
	playerDataFields.byFieldName.gotCharm_32,
	playerDataFields.byFieldName.gotCharm_33,
	playerDataFields.byFieldName.gotCharm_34,
	playerDataFields.byFieldName.gotCharm_35,
	playerDataFields.byFieldName.gotCharm_36,
	playerDataFields.byFieldName.gotCharm_37,
	playerDataFields.byFieldName.gotCharm_38,
	playerDataFields.byFieldName.gotCharm_39,
	playerDataFields.byFieldName.gotCharm_40,
	playerDataFields.byFieldName.royalCharmState,

	playerDataFields.byFieldName.fragileHealth_unbreakable,
	playerDataFields.byFieldName.fragileStrength_unbreakable,
	playerDataFields.byFieldName.fragileGreed_unbreakable,
	playerDataFields.byFieldName.brokenCharm_23,
	playerDataFields.byFieldName.brokenCharm_24,
	playerDataFields.byFieldName.brokenCharm_25,
	playerDataFields.byFieldName.grimmChildLevel,

	playerDataFields.byFieldName.completionPercentage,

	// grubs
	playerDataFields.byFieldName.grubsCollected,
	playerDataFields.byFieldName.grubRewards,

	// flower
	playerDataFields.byFieldName.hasXunFlower,
	playerDataFields.byFieldName.xunFlowerBroken,

	// shade
	playerDataFields.byFieldName.shadeScene,
	playerDataFields.byFieldName.shadePositionX,
	playerDataFields.byFieldName.shadePositionY,

	// dreamgate
	playerDataFields.byFieldName.dreamGateScene,
	playerDataFields.byFieldName.dreamGateX,
	playerDataFields.byFieldName.dreamGateY,
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

export class FrameEndEvent extends RecordingEventBase implements FrameEndBase {
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
	previousFrameEndEvent: FrameEndEvent | null = null;
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
		previousFrameEndEvent: FrameEndEvent | null,
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

		const previousgeo = getPreviousPlayerData(playerDataFields.byFieldName.geo);
		this.geo = previousgeo ? previousgeo.value : getDefaultPlayerDataValue(playerDataFields.byFieldName.geo);

		const previousgeoPool = getPreviousPlayerData(playerDataFields.byFieldName.geoPool);
		this.geoPool = previousgeoPool
			? previousgeoPool.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.geoPool);

		const previoustrinket1 = getPreviousPlayerData(playerDataFields.byFieldName.trinket1);
		this.trinket1 = previoustrinket1
			? previoustrinket1.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.trinket1);

		const previoustrinket2 = getPreviousPlayerData(playerDataFields.byFieldName.trinket2);
		this.trinket2 = previoustrinket2
			? previoustrinket2.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.trinket2);

		const previoustrinket3 = getPreviousPlayerData(playerDataFields.byFieldName.trinket3);
		this.trinket3 = previoustrinket3
			? previoustrinket3.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.trinket3);

		const previoustrinket4 = getPreviousPlayerData(playerDataFields.byFieldName.trinket4);
		this.trinket4 = previoustrinket4
			? previoustrinket4.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.trinket4);

		const previoushealth = getPreviousPlayerData(playerDataFields.byFieldName.health);
		this.health = previoushealth
			? previoushealth.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.health);

		const previousmaxHealth = getPreviousPlayerData(playerDataFields.byFieldName.maxHealth);
		this.maxHealth = previousmaxHealth
			? previousmaxHealth.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.maxHealth);

		const previoushealthBlue = getPreviousPlayerData(playerDataFields.byFieldName.healthBlue);
		this.healthBlue = previoushealthBlue
			? previoushealthBlue.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.healthBlue);

		const previousMPCharge = getPreviousPlayerData(playerDataFields.byFieldName.MPCharge);
		this.MPCharge = previousMPCharge
			? previousMPCharge.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.MPCharge);

		const previousMPReserve = getPreviousPlayerData(playerDataFields.byFieldName.MPReserve);
		this.MPReserve = previousMPReserve
			? previousMPReserve.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.MPReserve);

		const previouskilledFalseKnight = getPreviousPlayerData(playerDataFields.byFieldName.killedFalseKnight);
		this.killedFalseKnight = previouskilledFalseKnight
			? previouskilledFalseKnight.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.killedFalseKnight);

		const previoushornet1Defeated = getPreviousPlayerData(playerDataFields.byFieldName.hornet1Defeated);
		this.hornet1Defeated = previoushornet1Defeated
			? previoushornet1Defeated.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.hornet1Defeated);

		const previoushornetOutskirtsDefeated = getPreviousPlayerData(
			playerDataFields.byFieldName.hornetOutskirtsDefeated,
		);
		this.hornetOutskirtsDefeated = previoushornetOutskirtsDefeated
			? previoushornetOutskirtsDefeated.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.hornetOutskirtsDefeated);

		const previouskilledMantisLord = getPreviousPlayerData(playerDataFields.byFieldName.killedMantisLord);
		this.killedMantisLord = previouskilledMantisLord
			? previouskilledMantisLord.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.killedMantisLord);

		const previouskilledMageLord = getPreviousPlayerData(playerDataFields.byFieldName.killedMageLord);
		this.killedMageLord = previouskilledMageLord
			? previouskilledMageLord.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.killedMageLord);

		const previouskilledDungDefender = getPreviousPlayerData(playerDataFields.byFieldName.killedDungDefender);
		this.killedDungDefender = previouskilledDungDefender
			? previouskilledDungDefender.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.killedDungDefender);

		const previouskilledBlackKnight = getPreviousPlayerData(playerDataFields.byFieldName.killedBlackKnight);
		this.killedBlackKnight = previouskilledBlackKnight
			? previouskilledBlackKnight.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.killedBlackKnight);

		const previouskilledInfectedKnight = getPreviousPlayerData(playerDataFields.byFieldName.killedInfectedKnight);
		this.killedInfectedKnight = previouskilledInfectedKnight
			? previouskilledInfectedKnight.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.killedInfectedKnight);

		const previouskilledMimicSpider = getPreviousPlayerData(playerDataFields.byFieldName.killedMimicSpider);
		this.killedMimicSpider = previouskilledMimicSpider
			? previouskilledMimicSpider.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.killedMimicSpider);

		const previouskilledMegaJellyfish = getPreviousPlayerData(playerDataFields.byFieldName.killedMegaJellyfish);
		this.killedMegaJellyfish = previouskilledMegaJellyfish
			? previouskilledMegaJellyfish.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.killedMegaJellyfish);

		const previouskilledTraitorLord = getPreviousPlayerData(playerDataFields.byFieldName.killedTraitorLord);
		this.killedTraitorLord = previouskilledTraitorLord
			? previouskilledTraitorLord.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.killedTraitorLord);

		const previouskilledJarCollector = getPreviousPlayerData(playerDataFields.byFieldName.killedJarCollector);
		this.killedJarCollector = previouskilledJarCollector
			? previouskilledJarCollector.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.killedJarCollector);

		const previouskilledBigFly = getPreviousPlayerData(playerDataFields.byFieldName.killedBigFly);
		this.killedBigFly = previouskilledBigFly
			? previouskilledBigFly.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.killedBigFly);

		const previouskilledMawlek = getPreviousPlayerData(playerDataFields.byFieldName.killedMawlek);
		this.killedMawlek = previouskilledMawlek
			? previouskilledMawlek.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.killedMawlek);

		const previouskilledHiveKnight = getPreviousPlayerData(playerDataFields.byFieldName.killedHiveKnight);
		this.killedHiveKnight = previouskilledHiveKnight
			? previouskilledHiveKnight.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.killedHiveKnight);

		const previouscolosseumBronzeCompleted = getPreviousPlayerData(
			playerDataFields.byFieldName.colosseumBronzeCompleted,
		);
		this.colosseumBronzeCompleted = previouscolosseumBronzeCompleted
			? previouscolosseumBronzeCompleted.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.colosseumBronzeCompleted);

		const previouscolosseumSilverCompleted = getPreviousPlayerData(
			playerDataFields.byFieldName.colosseumSilverCompleted,
		);
		this.colosseumSilverCompleted = previouscolosseumSilverCompleted
			? previouscolosseumSilverCompleted.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.colosseumSilverCompleted);

		const previouscolosseumGoldCompleted = getPreviousPlayerData(
			playerDataFields.byFieldName.colosseumGoldCompleted,
		);
		this.colosseumGoldCompleted = previouscolosseumGoldCompleted
			? previouscolosseumGoldCompleted.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.colosseumGoldCompleted);

		const previouskilledGhostAladar = getPreviousPlayerData(playerDataFields.byFieldName.killedGhostAladar);
		this.killedGhostAladar = previouskilledGhostAladar
			? previouskilledGhostAladar.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.killedGhostAladar);

		const previouskilledGhostHu = getPreviousPlayerData(playerDataFields.byFieldName.killedGhostHu);
		this.killedGhostHu = previouskilledGhostHu
			? previouskilledGhostHu.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.killedGhostHu);

		const previouskilledGhostXero = getPreviousPlayerData(playerDataFields.byFieldName.killedGhostXero);
		this.killedGhostXero = previouskilledGhostXero
			? previouskilledGhostXero.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.killedGhostXero);

		const previouskilledGhostMarkoth = getPreviousPlayerData(playerDataFields.byFieldName.killedGhostMarkoth);
		this.killedGhostMarkoth = previouskilledGhostMarkoth
			? previouskilledGhostMarkoth.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.killedGhostMarkoth);

		const previouskilledGhostNoEyes = getPreviousPlayerData(playerDataFields.byFieldName.killedGhostNoEyes);
		this.killedGhostNoEyes = previouskilledGhostNoEyes
			? previouskilledGhostNoEyes.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.killedGhostNoEyes);

		const previouskilledGhostMarmu = getPreviousPlayerData(playerDataFields.byFieldName.killedGhostMarmu);
		this.killedGhostMarmu = previouskilledGhostMarmu
			? previouskilledGhostMarmu.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.killedGhostMarmu);

		const previouskilledGhostGalien = getPreviousPlayerData(playerDataFields.byFieldName.killedGhostGalien);
		this.killedGhostGalien = previouskilledGhostGalien
			? previouskilledGhostGalien.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.killedGhostGalien);

		const previousfireballLevel = getPreviousPlayerData(playerDataFields.byFieldName.fireballLevel);
		this.fireballLevel = previousfireballLevel
			? previousfireballLevel.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.fireballLevel);

		const previousquakeLevel = getPreviousPlayerData(playerDataFields.byFieldName.quakeLevel);
		this.quakeLevel = previousquakeLevel
			? previousquakeLevel.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.quakeLevel);

		const previousscreamLevel = getPreviousPlayerData(playerDataFields.byFieldName.screamLevel);
		this.screamLevel = previousscreamLevel
			? previousscreamLevel.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.screamLevel);

		const previoushasCyclone = getPreviousPlayerData(playerDataFields.byFieldName.hasCyclone);
		this.hasCyclone = previoushasCyclone
			? previoushasCyclone.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.hasCyclone);

		const previoushasDashSlash = getPreviousPlayerData(playerDataFields.byFieldName.hasDashSlash);
		this.hasDashSlash = previoushasDashSlash
			? previoushasDashSlash.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.hasDashSlash);

		const previoushasUpwardSlash = getPreviousPlayerData(playerDataFields.byFieldName.hasUpwardSlash);
		this.hasUpwardSlash = previoushasUpwardSlash
			? previoushasUpwardSlash.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.hasUpwardSlash);

		const previoushasDash = getPreviousPlayerData(playerDataFields.byFieldName.hasDash);
		this.hasDash = previoushasDash
			? previoushasDash.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.hasDash);

		const previoushasWalljump = getPreviousPlayerData(playerDataFields.byFieldName.hasWalljump);
		this.hasWalljump = previoushasWalljump
			? previoushasWalljump.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.hasWalljump);

		const previoushasDoubleJump = getPreviousPlayerData(playerDataFields.byFieldName.hasDoubleJump);
		this.hasDoubleJump = previoushasDoubleJump
			? previoushasDoubleJump.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.hasDoubleJump);

		const previoushasAcidArmour = getPreviousPlayerData(playerDataFields.byFieldName.hasAcidArmour);
		this.hasAcidArmour = previoushasAcidArmour
			? previoushasAcidArmour.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.hasAcidArmour);

		const previoushasSuperDash = getPreviousPlayerData(playerDataFields.byFieldName.hasSuperDash);
		this.hasSuperDash = previoushasSuperDash
			? previoushasSuperDash.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.hasSuperDash);

		const previoushasShadowDash = getPreviousPlayerData(playerDataFields.byFieldName.hasShadowDash);
		this.hasShadowDash = previoushasShadowDash
			? previoushasShadowDash.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.hasShadowDash);

		const previoushasKingsBrand = getPreviousPlayerData(playerDataFields.byFieldName.hasKingsBrand);
		this.hasKingsBrand = previoushasKingsBrand
			? previoushasKingsBrand.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.hasKingsBrand);

		const previouslurienDefeated = getPreviousPlayerData(playerDataFields.byFieldName.lurienDefeated);
		this.lurienDefeated = previouslurienDefeated
			? previouslurienDefeated.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.lurienDefeated);

		const previoushegemolDefeated = getPreviousPlayerData(playerDataFields.byFieldName.hegemolDefeated);
		this.hegemolDefeated = previoushegemolDefeated
			? previoushegemolDefeated.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.hegemolDefeated);

		const previousmonomonDefeated = getPreviousPlayerData(playerDataFields.byFieldName.monomonDefeated);
		this.monomonDefeated = previousmonomonDefeated
			? previousmonomonDefeated.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.monomonDefeated);

		const previoushasDreamNail = getPreviousPlayerData(playerDataFields.byFieldName.hasDreamNail);
		this.hasDreamNail = previoushasDreamNail
			? previoushasDreamNail.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.hasDreamNail);

		const previousdreamNailUpgraded = getPreviousPlayerData(playerDataFields.byFieldName.dreamNailUpgraded);
		this.dreamNailUpgraded = previousdreamNailUpgraded
			? previousdreamNailUpgraded.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.dreamNailUpgraded);

		const previousdreamOrbs = getPreviousPlayerData(playerDataFields.byFieldName.dreamOrbs);
		this.dreamOrbs = previousdreamOrbs
			? previousdreamOrbs.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.dreamOrbs);

		const previousmothDeparted = getPreviousPlayerData(playerDataFields.byFieldName.mothDeparted);
		this.mothDeparted = previousmothDeparted
			? previousmothDeparted.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.mothDeparted);

		const previousnailSmithUpgrades = getPreviousPlayerData(playerDataFields.byFieldName.nailSmithUpgrades);
		this.nailSmithUpgrades = previousnailSmithUpgrades
			? previousnailSmithUpgrades.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.nailSmithUpgrades);

		const previousmaxHealthBase = getPreviousPlayerData(playerDataFields.byFieldName.maxHealthBase);
		this.maxHealthBase = previousmaxHealthBase
			? previousmaxHealthBase.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.maxHealthBase);

		const previousMPReserveMax = getPreviousPlayerData(playerDataFields.byFieldName.MPReserveMax);
		this.MPReserveMax = previousMPReserveMax
			? previousMPReserveMax.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.MPReserveMax);

		const previouskilledGrimm = getPreviousPlayerData(playerDataFields.byFieldName.killedGrimm);
		this.killedGrimm = previouskilledGrimm
			? previouskilledGrimm.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.killedGrimm);

		const previouskilledNightmareGrimm = getPreviousPlayerData(playerDataFields.byFieldName.killedNightmareGrimm);
		this.killedNightmareGrimm = previouskilledNightmareGrimm
			? previouskilledNightmareGrimm.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.killedNightmareGrimm);

		const previousdestroyedNightmareLantern = getPreviousPlayerData(
			playerDataFields.byFieldName.destroyedNightmareLantern,
		);
		this.destroyedNightmareLantern = previousdestroyedNightmareLantern
			? previousdestroyedNightmareLantern.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.destroyedNightmareLantern);

		const previoushasGodfinder = getPreviousPlayerData(playerDataFields.byFieldName.hasGodfinder);
		this.hasGodfinder = previoushasGodfinder
			? previoushasGodfinder.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.hasGodfinder);

		const previousbossDoorStateTier1 = getPreviousPlayerData(playerDataFields.byFieldName.bossDoorStateTier1);
		this.bossDoorStateTier1 = previousbossDoorStateTier1
			? previousbossDoorStateTier1.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.bossDoorStateTier1);

		const previousbossDoorStateTier2 = getPreviousPlayerData(playerDataFields.byFieldName.bossDoorStateTier2);
		this.bossDoorStateTier2 = previousbossDoorStateTier2
			? previousbossDoorStateTier2.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.bossDoorStateTier2);

		const previousbossDoorStateTier3 = getPreviousPlayerData(playerDataFields.byFieldName.bossDoorStateTier3);
		this.bossDoorStateTier3 = previousbossDoorStateTier3
			? previousbossDoorStateTier3.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.bossDoorStateTier3);

		const previousbossDoorStateTier4 = getPreviousPlayerData(playerDataFields.byFieldName.bossDoorStateTier4);
		this.bossDoorStateTier4 = previousbossDoorStateTier4
			? previousbossDoorStateTier4.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.bossDoorStateTier4);

		const previousgotCharm_1 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_1);
		this.gotCharm_1 = previousgotCharm_1
			? previousgotCharm_1.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_1);

		const previousgotCharm_2 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_2);
		this.gotCharm_2 = previousgotCharm_2
			? previousgotCharm_2.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_2);

		const previousgotCharm_3 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_3);
		this.gotCharm_3 = previousgotCharm_3
			? previousgotCharm_3.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_3);

		const previousgotCharm_4 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_4);
		this.gotCharm_4 = previousgotCharm_4
			? previousgotCharm_4.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_4);

		const previousgotCharm_5 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_5);
		this.gotCharm_5 = previousgotCharm_5
			? previousgotCharm_5.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_5);

		const previousgotCharm_6 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_6);
		this.gotCharm_6 = previousgotCharm_6
			? previousgotCharm_6.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_6);

		const previousgotCharm_7 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_7);
		this.gotCharm_7 = previousgotCharm_7
			? previousgotCharm_7.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_7);

		const previousgotCharm_8 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_8);
		this.gotCharm_8 = previousgotCharm_8
			? previousgotCharm_8.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_8);

		const previousgotCharm_9 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_9);
		this.gotCharm_9 = previousgotCharm_9
			? previousgotCharm_9.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_9);

		const previousgotCharm_10 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_10);
		this.gotCharm_10 = previousgotCharm_10
			? previousgotCharm_10.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_10);

		const previousgotCharm_11 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_11);
		this.gotCharm_11 = previousgotCharm_11
			? previousgotCharm_11.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_11);

		const previousgotCharm_12 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_12);
		this.gotCharm_12 = previousgotCharm_12
			? previousgotCharm_12.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_12);

		const previousgotCharm_13 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_13);
		this.gotCharm_13 = previousgotCharm_13
			? previousgotCharm_13.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_13);

		const previousgotCharm_14 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_14);
		this.gotCharm_14 = previousgotCharm_14
			? previousgotCharm_14.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_14);

		const previousgotCharm_15 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_15);
		this.gotCharm_15 = previousgotCharm_15
			? previousgotCharm_15.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_15);

		const previousgotCharm_16 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_16);
		this.gotCharm_16 = previousgotCharm_16
			? previousgotCharm_16.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_16);

		const previousgotCharm_17 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_17);
		this.gotCharm_17 = previousgotCharm_17
			? previousgotCharm_17.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_17);

		const previousgotCharm_18 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_18);
		this.gotCharm_18 = previousgotCharm_18
			? previousgotCharm_18.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_18);

		const previousgotCharm_19 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_19);
		this.gotCharm_19 = previousgotCharm_19
			? previousgotCharm_19.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_19);

		const previousgotCharm_20 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_20);
		this.gotCharm_20 = previousgotCharm_20
			? previousgotCharm_20.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_20);

		const previousgotCharm_21 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_21);
		this.gotCharm_21 = previousgotCharm_21
			? previousgotCharm_21.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_21);

		const previousgotCharm_22 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_22);
		this.gotCharm_22 = previousgotCharm_22
			? previousgotCharm_22.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_22);

		const previousgotCharm_23 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_23);
		this.gotCharm_23 = previousgotCharm_23
			? previousgotCharm_23.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_23);

		const previousgotCharm_24 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_24);
		this.gotCharm_24 = previousgotCharm_24
			? previousgotCharm_24.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_24);

		const previousgotCharm_25 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_25);
		this.gotCharm_25 = previousgotCharm_25
			? previousgotCharm_25.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_25);

		const previousgotCharm_26 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_26);
		this.gotCharm_26 = previousgotCharm_26
			? previousgotCharm_26.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_26);

		const previousgotCharm_27 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_27);
		this.gotCharm_27 = previousgotCharm_27
			? previousgotCharm_27.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_27);

		const previousgotCharm_28 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_28);
		this.gotCharm_28 = previousgotCharm_28
			? previousgotCharm_28.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_28);

		const previousgotCharm_29 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_29);
		this.gotCharm_29 = previousgotCharm_29
			? previousgotCharm_29.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_29);

		const previousgotCharm_30 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_30);
		this.gotCharm_30 = previousgotCharm_30
			? previousgotCharm_30.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_30);

		const previousgotCharm_31 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_31);
		this.gotCharm_31 = previousgotCharm_31
			? previousgotCharm_31.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_31);

		const previousgotCharm_32 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_32);
		this.gotCharm_32 = previousgotCharm_32
			? previousgotCharm_32.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_32);

		const previousgotCharm_33 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_33);
		this.gotCharm_33 = previousgotCharm_33
			? previousgotCharm_33.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_33);

		const previousgotCharm_34 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_34);
		this.gotCharm_34 = previousgotCharm_34
			? previousgotCharm_34.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_34);

		const previousgotCharm_35 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_35);
		this.gotCharm_35 = previousgotCharm_35
			? previousgotCharm_35.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_35);

		const previousgotCharm_36 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_36);
		this.gotCharm_36 = previousgotCharm_36
			? previousgotCharm_36.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_36);

		const previousgotCharm_37 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_37);
		this.gotCharm_37 = previousgotCharm_37
			? previousgotCharm_37.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_37);

		const previousgotCharm_38 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_38);
		this.gotCharm_38 = previousgotCharm_38
			? previousgotCharm_38.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_38);

		const previousgotCharm_39 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_39);
		this.gotCharm_39 = previousgotCharm_39
			? previousgotCharm_39.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_39);

		const previousgotCharm_40 = getPreviousPlayerData(playerDataFields.byFieldName.gotCharm_40);
		this.gotCharm_40 = previousgotCharm_40
			? previousgotCharm_40.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.gotCharm_40);

		const previousroyalCharmState = getPreviousPlayerData(playerDataFields.byFieldName.royalCharmState);
		this.royalCharmState = previousroyalCharmState
			? previousroyalCharmState.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.royalCharmState);

		const previousfragileHealth_unbreakable = getPreviousPlayerData(
			playerDataFields.byFieldName.fragileHealth_unbreakable,
		);
		this.fragileHealth_unbreakable = previousfragileHealth_unbreakable
			? previousfragileHealth_unbreakable.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.fragileHealth_unbreakable);

		const previousfragileStrength_unbreakable = getPreviousPlayerData(
			playerDataFields.byFieldName.fragileStrength_unbreakable,
		);
		this.fragileStrength_unbreakable = previousfragileStrength_unbreakable
			? previousfragileStrength_unbreakable.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.fragileStrength_unbreakable);

		const previousfragileGreed_unbreakable = getPreviousPlayerData(
			playerDataFields.byFieldName.fragileGreed_unbreakable,
		);
		this.fragileGreed_unbreakable = previousfragileGreed_unbreakable
			? previousfragileGreed_unbreakable.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.fragileGreed_unbreakable);

		const previousbrokenCharm_23 = getPreviousPlayerData(playerDataFields.byFieldName.brokenCharm_23);
		this.brokenCharm_23 = previousbrokenCharm_23
			? previousbrokenCharm_23.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.brokenCharm_23);

		const previousbrokenCharm_24 = getPreviousPlayerData(playerDataFields.byFieldName.brokenCharm_24);
		this.brokenCharm_24 = previousbrokenCharm_24
			? previousbrokenCharm_24.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.brokenCharm_24);

		const previousbrokenCharm_25 = getPreviousPlayerData(playerDataFields.byFieldName.brokenCharm_25);
		this.brokenCharm_25 = previousbrokenCharm_25
			? previousbrokenCharm_25.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.brokenCharm_25);

		const previousgrimmChildLevel = getPreviousPlayerData(playerDataFields.byFieldName.grimmChildLevel);
		this.grimmChildLevel = previousgrimmChildLevel
			? previousgrimmChildLevel.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.grimmChildLevel);

		const previouscompletionPercentage = getPreviousPlayerData(playerDataFields.byFieldName.completionPercentage);
		this.completionPercentage = previouscompletionPercentage
			? previouscompletionPercentage.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.completionPercentage);

		const previousgrubsCollected = getPreviousPlayerData(playerDataFields.byFieldName.grubsCollected);
		this.grubsCollected = previousgrubsCollected
			? previousgrubsCollected.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.grubsCollected);

		const previousgrubRewards = getPreviousPlayerData(playerDataFields.byFieldName.grubRewards);
		this.grubRewards = previousgrubRewards
			? previousgrubRewards.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.grubRewards);

		const previousHasXunFlower = getPreviousPlayerData(playerDataFields.byFieldName.hasXunFlower);
		this.hasXunFlower = previousHasXunFlower
			? previousHasXunFlower.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.hasXunFlower);
		const previousXunFlowerBroken = getPreviousPlayerData(playerDataFields.byFieldName.xunFlowerBroken);
		this.xunFlowerBroken = previousXunFlowerBroken
			? previousXunFlowerBroken.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.xunFlowerBroken);

		this.dead = getPreviousHeroState(heroStateFields.byFieldName.dead)?.value ?? false;

		const previousShadeScene = getPreviousPlayerData(playerDataFields.byFieldName.shadeScene);
		this.shadeScene = previousShadeScene
			? previousShadeScene.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.shadeScene);

		const previousShadePositionX = getPreviousPlayerData(playerDataFields.byFieldName.shadePositionX);
		this.shadePositionX = previousShadePositionX
			? previousShadePositionX.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.shadePositionX);
		const previousShadePositionY = getPreviousPlayerData(playerDataFields.byFieldName.shadePositionY);
		this.shadePositionY = previousShadePositionY
			? previousShadePositionY.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.shadePositionY);

		const previousDreamGateScene = getPreviousPlayerData(playerDataFields.byFieldName.dreamGateScene);
		this.dreamGateScene = previousDreamGateScene
			? previousDreamGateScene.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.dreamGateScene);
		const previousDreamGateX = getPreviousPlayerData(playerDataFields.byFieldName.dreamGateX);
		this.dreamGateX = previousDreamGateX
			? previousDreamGateX.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.dreamGateX);
		const previousDreamGateY = getPreviousPlayerData(playerDataFields.byFieldName.dreamGateY);
		this.dreamGateY = previousDreamGateY
			? previousDreamGateY.value
			: getDefaultPlayerDataValue(playerDataFields.byFieldName.dreamGateY);

		// end auto generated from code above

		this.trinketGeo = this.trinket1 * 200 + this.trinket2 * 450 + this.trinket3 * 800 + this.trinket4 * 2000;
		this.geoTotal = this.geo + this.trinketGeo + this.geoPool;
		this.healthLost = this.maxHealth - this.health;

		this.grubsNoRewardCollected = this.grubsCollected - this.grubRewards;

		this.MPTotal = this.MPCharge + this.MPReserve;

		this.completionPercentageEarlyCalc = countGameCompletion(this);

		this.healthTotal = this.health + this.healthBlue;
	}
}

export type FrameEndEventNumberKeys = {
	[TField in keyof FrameEndEvent as FrameEndEvent[TField] extends number ? TField : never]: number;
};
export type FrameEndEventNumberKey = keyof FrameEndEventNumberKeys;
