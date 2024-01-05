import { z } from 'zod';
import { tagGroupSchema, tagSchema } from '~/lib/types/tags';

export const runFilterParamsSchema = z.object({
    tag: z.union([tagSchema, tagGroupSchema]).optional(),
});
export type RunFilterParams = z.infer<typeof runFilterParamsSchema>;
