import { ColorClasses } from '~/lib/viz/colors';

export type SplitGroupId = string & { __brand: 'SplitGroupId' };

export interface SplitGroup {
	id: SplitGroupId;
	displayName: string;
	description: string;
	defaultShown: boolean;
	color: ColorClasses;
}

export function createSplitGroup<TId extends string>(
	id: TId,
	options: Omit<SplitGroup, 'id'>,
): {
	[K in TId]: SplitGroup;
} {
	return {
		[id]: {
			id: id as string as SplitGroupId,
			...options,
		},
	} as {
		[K in TId]: SplitGroup;
	};
}
