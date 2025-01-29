import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { env } from '~/env';
import * as schema from './schema';
const client = createClient({
	url: env.DATABASE_URL,
	authToken: env.DATABASE_AUTH_TOKEN,
});
export const db = drizzle({ client, schema });

export type DB = typeof db | Parameters<Parameters<(typeof db)['transaction']>[0]>[0];
