// pages/api/[...trpc].ts
import { type NextApiRequest, type NextApiResponse } from 'next';
import { createOpenApiNextHandler } from 'trpc-openapi';
import { appRouter } from '~/server/api/root';
import { createTRPCContext } from '~/server/api/trpc';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    return createOpenApiNextHandler({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
        router: appRouter as any,
        createContext: () => createTRPCContext({ req }),
    })(req, res);
}
