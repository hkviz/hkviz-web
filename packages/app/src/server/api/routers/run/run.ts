import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export const runRouter = createTRPCRouter({
    setTitle: publicProcedure
        .input(
            z.object({
                id: z.string().uuid(),
            }),
        )
        .mutation(async ({ input }) => {
            await delay(10);
            return input;
        }),
});
