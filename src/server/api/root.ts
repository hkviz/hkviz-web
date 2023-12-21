import { createTRPCRouter } from '~/server/api/trpc';
import { accountRouter } from './routers/account';
import { ingameAuthRouter } from './routers/ingameauth';
import { runRouter } from './routers/run';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    run: runRouter,
    ingameAuth: ingameAuthRouter,
    account: accountRouter,
});
