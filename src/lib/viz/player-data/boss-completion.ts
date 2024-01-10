// Boss door completion
export type BossSequenceDoorCompletion = string & { __brand: 'BossSequenceDoorCompletion' };
export const BossSequenceDoorCompletion = {
    canUnlock(bossSequenceDoorCompletion: BossSequenceDoorCompletion | undefined) {
        return !!bossSequenceDoorCompletion && bossSequenceDoorCompletion.startsWith('1');
    },
    unlocked(bossSequenceDoorCompletion: BossSequenceDoorCompletion | undefined) {
        return !!bossSequenceDoorCompletion && bossSequenceDoorCompletion[1] === '1';
    },
    completed(bossSequenceDoorCompletion: BossSequenceDoorCompletion | undefined) {
        return !!bossSequenceDoorCompletion && bossSequenceDoorCompletion[2] === '1';
    },
    allBindings(bossSequenceDoorCompletion: BossSequenceDoorCompletion | undefined) {
        return !!bossSequenceDoorCompletion && bossSequenceDoorCompletion[3] === '1';
    },
    noHits(bossSequenceDoorCompletion: BossSequenceDoorCompletion | undefined) {
        return !!bossSequenceDoorCompletion && bossSequenceDoorCompletion[4] === '1';
    },
    boundNail(bossSequenceDoorCompletion: BossSequenceDoorCompletion | undefined) {
        return !!bossSequenceDoorCompletion && bossSequenceDoorCompletion[5] === '1';
    },
    boundShell(bossSequenceDoorCompletion: BossSequenceDoorCompletion | undefined) {
        return !!bossSequenceDoorCompletion && bossSequenceDoorCompletion[6] === '1';
    },
    boundCharms(bossSequenceDoorCompletion: BossSequenceDoorCompletion | undefined) {
        return !!bossSequenceDoorCompletion && bossSequenceDoorCompletion[7] === '1';
    },
    boundSoul(bossSequenceDoorCompletion: BossSequenceDoorCompletion | undefined) {
        return !!bossSequenceDoorCompletion && bossSequenceDoorCompletion[8] === '1';
    },
};

// Boss statue completion
export type BossStatueCompletion = string & { __brand: 'BossStatueCompletion' };
