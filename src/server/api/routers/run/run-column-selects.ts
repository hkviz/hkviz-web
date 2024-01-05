import { tags, type TagCode } from '~/lib/types/tags';
import { type runFiles, type runs } from '~/server/db/schema';

type RunFileColumnSelect = Partial<{ [Col in keyof (typeof runFiles)['$columns']]: true }>;
type RunColumnSelect = Partial<{ [Col in keyof (typeof runs)['$columns']]: true }>;

export const runFilesMetaFieldsSelect = {
    hkVersion: true,
    playTime: true,
    maxHealth: true,
    mpReserveMax: true,
    geo: true,
    dreamOrbs: true,
    permadeathMode: true,
    mapZone: true,
    killedHollowKnight: true,
    killedFinalBoss: true,
    killedVoidIdol: true,
    completionPercentage: true,
    unlockedCompletionRate: true,
    dreamNailUpgraded: true,
    lastScene: true,
} satisfies RunFileColumnSelect;

export const runTagFieldsSelect = Object.fromEntries(tags.map((tag) => [`tag_${tag.code}`, true])) as {
    [Code in TagCode as `tag_${Code}`]: true;
} satisfies RunColumnSelect;
