import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { appRouter } from './root';

export type AppRouter = typeof appRouter;
export type AppRouterInput = inferRouterInputs<AppRouter>;
export type AppRouterOutput = inferRouterOutputs<AppRouter>;

export type RunFullData = AppRouterOutput['run']['getMetadataById'];
