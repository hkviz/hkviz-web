import { Client } from '@planetscale/database';
import { drizzle } from 'drizzle-orm/planetscale-serverless';

import { env } from '~/env';
import * as schema from './schema';

export const db = drizzle(
	new Client({
		url: env.DATABASE_URL,
	}),
	{
		schema, //
		// logger: true
	},
);

export type DB = typeof db | Parameters<Parameters<(typeof db)['transaction']>[0]>[0];
