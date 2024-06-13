import { type InferSelectModel } from 'drizzle-orm';
import { tags, type TagCode } from '~/lib/types/tags';
import { type RunGameStateMetaColumnName, type runFiles, type runs } from '~/server/db/schema';

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

    startedAt: true,
    endedAt: true,
} satisfies RunFileColumnSelect;

export const runTagFieldsSelect = Object.fromEntries(tags.map((tag) => [`tag_${tag.code}`, true])) as {
    [Code in TagCode as `tag_${Code}`]: true;
} satisfies RunColumnSelect;

export const runGameStateMetaColumnsSelect = {
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

    startedAt: true,
    endedAt: true,
} as const satisfies {
    [Col in RunGameStateMetaColumnName]: true;
} satisfies RunColumnSelect satisfies RunFileColumnSelect;

type RunGameStateMeta = Pick<InferSelectModel<typeof runs>, RunGameStateMetaColumnName>;

export function getGameStateMeta(run: RunGameStateMeta): RunGameStateMeta {
    const picked: any = {};
    for (const col of Object.keys(runGameStateMetaColumnsSelect) as RunGameStateMetaColumnName[]) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        picked[col] = run[col];
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return picked;
}
