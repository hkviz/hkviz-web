import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const runRouter = createTRPCRouter({
    setTitle: publicProcedure
        .input(
            z.object({
                id: z.string().uuid(),
            }),
        )
        .mutation(async ({ input }) => {
            return input;
        }),
});
