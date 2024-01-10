import { getDefaultValue as getDefaultPlayerDataValue, playerDataFields, type PlayerDataField } from '../../player-data/player-data';
import { countGameCompletion } from '../ingame-percentage';
import { type PlayerDataEvent } from './player-data-event';
import { RecordingEventBase, type RecordingEventBaseOptions } from './recording-event-base';

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

    playerDataFields.byFieldName.completionPercentage,
] as const;
export const frameEndEventPlayerDataFields = new Set<PlayerDataField>(frameEndEventPlayerDataFieldsArray);

type FrameEndEventPlayerDataField = (typeof frameEndEventPlayerDataFieldsArray)[number];

type FrameEndPlayerDataBase = {
    [TField in FrameEndEventPlayerDataField as TField['name']]: PlayerDataEvent<TField>['value'];
} & RecordingEventBase;
const FrameEndPlayerDataBase = RecordingEventBase as new (options: RecordingEventBaseOptions) => FrameEndPlayerDataBase;

/**
 * Synthetic event / not actually recorded
 * created by recording combiner whenever the timestamp changes if any of the values in it changed
 */
type FrameEndEventOptions = RecordingEventBaseOptions & {
    getPreviousPlayerData: <TField extends PlayerDataField>(field: TField) => PlayerDataEvent<TField> | undefined;
};
export class FrameEndEvent extends FrameEndPlayerDataBase {
    completionPercentageEarlyCalc: number;
    healthLost: number;
    trinketGeo: number;

    constructor(options: FrameEndEventOptions) {
        super(options);

        for (const field of frameEndEventPlayerDataFields) {
            const previousPlayerDataEvent = options.getPreviousPlayerData(field);
            if (previousPlayerDataEvent) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
                (this as any)[field.name] = previousPlayerDataEvent.value;
            } else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
                (this as any)[field.name] = getDefaultPlayerDataValue(field);
            }
        }

        this.trinketGeo = this.trinket1 * 200 + this.trinket2 * 450 + this.trinket3 * 800 + this.trinket4 * 2000;
        this.healthLost = this.maxHealth - this.health;
        this.completionPercentageEarlyCalc = countGameCompletion(this);
    }
}