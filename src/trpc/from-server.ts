import { appRouter } from '~/server/api/root';
import { createInnerTRPCContext, createTRPCContext } from '~/server/api/trpc';
import { headers } from 'next/headers';

export const apiFromServer = async () => appRouter.createCaller(await createInnerTRPCContext({ headers: headers() }));
