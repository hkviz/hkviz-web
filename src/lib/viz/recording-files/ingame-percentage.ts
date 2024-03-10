// this file is not licensed under the project license
// it is largely taken from a decompiled Hollow Knight code file

import { BossSequenceDoorCompletion } from '../player-data/boss-completion';
import { type FrameEndEvent } from './events/frame-end-event';

function countCharms(frameEndEvent: FrameEndEvent) {
    let charmsOwned = 0;
    if (frameEndEvent.gotCharm_1) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_2) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_3) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_4) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_5) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_6) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_7) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_8) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_9) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_10) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_11) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_12) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_13) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_14) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_15) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_16) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_17) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_18) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_19) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_20) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_21) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_22) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_23) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_24) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_25) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_26) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_27) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_28) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_29) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_30) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_31) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_32) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_33) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_34) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_35) {
        charmsOwned++;
    }
    if (frameEndEvent.royalCharmState > 2) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_37) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_38) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_39) {
        charmsOwned++;
    }
    if (frameEndEvent.gotCharm_40) {
        charmsOwned++;
    }
    return charmsOwned;
}

export function countGameCompletion(frameEndEvent: FrameEndEvent) {
    let completionPercentage = 0;
    completionPercentage += countCharms(frameEndEvent);
    if (frameEndEvent.killedFalseKnight) {
        completionPercentage += 1;
    }
    if (frameEndEvent.hornet1Defeated) {
        completionPercentage += 1;
    }
    if (frameEndEvent.hornetOutskirtsDefeated) {
        completionPercentage += 1;
    }
    if (frameEndEvent.killedMantisLord) {
        completionPercentage += 1;
    }
    if (frameEndEvent.killedMageLord) {
        completionPercentage += 1;
    }
    if (frameEndEvent.killedDungDefender) {
        completionPercentage += 1;
    }
    if (frameEndEvent.killedBlackKnight) {
        completionPercentage += 1;
    }
    if (frameEndEvent.killedInfectedKnight) {
        completionPercentage += 1;
    }
    if (frameEndEvent.killedMimicSpider) {
        completionPercentage += 1;
    }
    if (frameEndEvent.killedMegaJellyfish) {
        completionPercentage += 1;
    }
    if (frameEndEvent.killedTraitorLord) {
        completionPercentage += 1;
    }
    if (frameEndEvent.killedJarCollector) {
        completionPercentage += 1;
    }
    if (frameEndEvent.killedBigFly) {
        completionPercentage += 1;
    }
    if (frameEndEvent.killedMawlek) {
        completionPercentage += 1;
    }
    if (frameEndEvent.killedHiveKnight) {
        completionPercentage += 1;
    }
    if (frameEndEvent.colosseumBronzeCompleted) {
        completionPercentage += 1;
    }
    if (frameEndEvent.colosseumSilverCompleted) {
        completionPercentage += 1;
    }
    if (frameEndEvent.colosseumGoldCompleted) {
        completionPercentage += 1;
    }
    if (frameEndEvent.killedGhostAladar) {
        completionPercentage += 1;
    }
    if (frameEndEvent.killedGhostHu) {
        completionPercentage += 1;
    }
    if (frameEndEvent.killedGhostXero) {
        completionPercentage += 1;
    }
    if (frameEndEvent.killedGhostMarkoth) {
        completionPercentage += 1;
    }
    if (frameEndEvent.killedGhostNoEyes) {
        completionPercentage += 1;
    }
    if (frameEndEvent.killedGhostMarmu) {
        completionPercentage += 1;
    }
    if (frameEndEvent.killedGhostGalien) {
        completionPercentage += 1;
    }
    completionPercentage += frameEndEvent.fireballLevel;
    completionPercentage += frameEndEvent.quakeLevel;
    completionPercentage += frameEndEvent.screamLevel;
    if (frameEndEvent.hasCyclone) {
        completionPercentage += 1;
    }
    if (frameEndEvent.hasDashSlash) {
        completionPercentage += 1;
    }
    if (frameEndEvent.hasUpwardSlash) {
        completionPercentage += 1;
    }
    if (frameEndEvent.hasDash) {
        completionPercentage += 2;
    }
    if (frameEndEvent.hasWalljump) {
        completionPercentage += 2;
    }
    if (frameEndEvent.hasDoubleJump) {
        completionPercentage += 2;
    }
    if (frameEndEvent.hasAcidArmour) {
        completionPercentage += 2;
    }
    if (frameEndEvent.hasSuperDash) {
        completionPercentage += 2;
    }
    if (frameEndEvent.hasShadowDash) {
        completionPercentage += 2;
    }
    if (frameEndEvent.hasKingsBrand) {
        completionPercentage += 2;
    }
    if (frameEndEvent.lurienDefeated) {
        completionPercentage += 1;
    }
    if (frameEndEvent.hegemolDefeated) {
        completionPercentage += 1;
    }
    if (frameEndEvent.monomonDefeated) {
        completionPercentage += 1;
    }
    if (frameEndEvent.hasDreamNail) {
        completionPercentage += 1;
    }
    if (frameEndEvent.dreamNailUpgraded) {
        completionPercentage += 1;
    }
    if (frameEndEvent.mothDeparted) {
        completionPercentage += 1;
    }
    completionPercentage += frameEndEvent.nailSmithUpgrades;
    completionPercentage += frameEndEvent.maxHealthBase - 5;
    switch (frameEndEvent.MPReserveMax) {
        case 33:
            completionPercentage += 1;
            break;
        case 66:
            completionPercentage += 2;
            break;
        case 99:
            completionPercentage += 3;
            break;
    }
    if (frameEndEvent.killedGrimm) {
        completionPercentage += 1;
    }
    if (frameEndEvent.killedNightmareGrimm || frameEndEvent.destroyedNightmareLantern) {
        completionPercentage += 1;
    }
    if (frameEndEvent.hasGodfinder) {
        completionPercentage += 1;
    }
    if (BossSequenceDoorCompletion.completed(frameEndEvent.bossDoorStateTier1)) {
        completionPercentage += 1;
    }
    if (BossSequenceDoorCompletion.completed(frameEndEvent.bossDoorStateTier2)) {
        completionPercentage += 1;
    }
    if (BossSequenceDoorCompletion.completed(frameEndEvent.bossDoorStateTier3)) {
        completionPercentage += 1;
    }
    if (BossSequenceDoorCompletion.completed(frameEndEvent.bossDoorStateTier4)) {
        completionPercentage += 1;
    }
    return completionPercentage;
}
