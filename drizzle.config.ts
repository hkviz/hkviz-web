import { type Config } from 'drizzle-kit';

import { env } from '~/env.mjs';

export default {
    schema: './src/server/db/schema.ts',
    driver: 'turso',
    dbCredentials: {
        url: env.TURSO_CONNECTION_URL,
        authToken: env.TURSO_AUTH_TOKEN,
    },
    tablesFilter: ['hkviz_*'],
} satisfies Config;
