import { postRouter } from '~/server/api/routers/post';
import { createTRPCRouter } from '~/server/api/trpc';
import { runRouter } from './routers/run';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    post: postRouter,
    run: runRouter,
});
