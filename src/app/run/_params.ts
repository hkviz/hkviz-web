import { z } from "zod";
import { tagSchema } from "~/lib/types/tags";

export const runFilterParamsSchema = z.object({
    tag: tagSchema.optional(),
});
export type RunFilterParams = z.infer<typeof runFilterParamsSchema>;