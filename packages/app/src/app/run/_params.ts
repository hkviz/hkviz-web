import { z } from 'zod';
import { runSortSchema } from '~/lib/types/run-sort';
import { tagGroupSchema, tagSchema } from '~/lib/types/tags';

export const runFilterParamsSchema = z.object({
    tag: z.union([tagSchema, tagGroupSchema]).optional(),
    sort: runSortSchema.optional(),
});
export type RunFilterParams = z.infer<typeof runFilterParamsSchema>;
