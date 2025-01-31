import * as v from 'valibot';

export const runSorts = [
	{
		code: 'newest',
		name: 'Newest',
	},
	{
		code: 'likes',
		name: 'Likes',
	},
] as const;

type CodesOf<T extends readonly { code: unknown }[]> = {
	[I in keyof T]: T[I]['code'];
};

type RunSort = (typeof runSorts)[number];
type RunSortCodes = CodesOf<typeof runSorts>;
export type RunSortCode = RunSortCodes[number];
export const runSortCodes = runSorts.map((it) => it.code) as unknown as RunSortCodes;
export const runSortSchema = v.pipe(
	v.string(),
	// previously likes were called favorites
	v.transform((it) => (it === 'favorites' ? 'likes' : it)),
	v.picklist(runSortCodes),
);

export function runSortFromCode(code: RunSortCode): RunSort {
	return runSorts.find((it) => it.code === code)!;
}

export const RUN_SORT_DEFAULT = 'newest' as const;
