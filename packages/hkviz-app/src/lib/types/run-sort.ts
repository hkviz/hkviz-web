import { z } from 'zod';

export const runSorts = [
    {
        code: 'favorites',
        name: 'Favorites',
    },
    {
        code: 'newest',
        name: 'Newest',
    },
] as const;

type CodesOf<T extends readonly { code: unknown }[]> = {
    [I in keyof T]: T[I]['code'];
};

type RunSort = (typeof runSorts)[number];
type RunSortCodes = CodesOf<typeof runSorts>;
export type RunSortCode = RunSortCodes[number];
export const runSortCodes = runSorts.map((it) => it.code) as unknown as RunSortCodes;
export const runSortSchema = z.enum(runSortCodes);

export function runSortFromCode(code: RunSortCode): RunSort {
    return runSorts.find((it) => it.code === code)!;
}
