import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { env } from './src/env';

export default defineConfig({
	out: './drizzle',
	schema: './src/server/db/schema.ts',
	dialect: 'turso',
	dbCredentials: {
		url: env.DATABASE_URL,
		authToken: env.DATABASE_AUTH_TOKEN,
	},
	tablesFilter: ['hkviz_*'],
});
