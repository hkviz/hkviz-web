import * as v from 'valibot';

const envSchema = v.object({
	DATABASE_URL: v.pipe(v.string(), v.url()),
	DATABASE_AUTH_TOKEN: v.string(),
	NODE_ENV: v.optional(v.picklist(['development', 'test', 'production']), 'development'),
	AUTH_SECRET: v.string(),
	// VERCEL_URL doesn't include `https` so it cant be validated as a URL
	AUTH_URL: v.string(),

	// discord
	DISCORD_CLIENT_ID: v.string(),
	DISCORD_CLIENT_SECRET: v.string(),

	// google
	GOOGLE_CLIENT_ID: v.string(),
	GOOGLE_CLIENT_SECRET: v.string(),

	// r2
	R2_ACCESS_KEY_ID: v.string(),
	R2_SECRET_ACCESS_KEY: v.string(),
	R2_BUCKET_NAME: v.string(),
	R2_ACCOUNT_ID: v.string(),
	R2_ENDPOINT: v.string(),
	R2_PUBLIC_BUCKET_URL: v.string(),

	// mails
	EMAIL_SERVER_HOST: v.string(),
	EMAIL_SERVER_PORT: v.pipe(v.unknown(), v.transform(Number)),
	EMAIL_SERVER_USER: v.string(),
	EMAIL_SERVER_PASSWORD: v.string(),
	EMAIL_FROM: v.string(),

	// aggregation pipeline
	FILE_DOWNLOAD_PATH: v.string(),

	// compat api
	COMPAT_API_KEY: v.string(),
});
export type Env = v.InferOutput<typeof envSchema>;

const envPreParse: Record<keyof Env, string | undefined> = {
	DATABASE_URL: process.env.DATABASE_URL,
	DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN,
	NODE_ENV: process.env.NODE_ENV,
	AUTH_SECRET: process.env.AUTH_SECRET,
	AUTH_URL: process.env.VERCEL_URL ?? process.env.AUTH_URL,

	DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
	DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,

	GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

	R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
	R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
	R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
	R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
	R2_ENDPOINT: process.env.R2_ENDPOINT,
	R2_PUBLIC_BUCKET_URL: process.env.R2_PUBLIC_BUCKET_URL,

	EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
	EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT,
	EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
	EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,
	EMAIL_FROM: process.env.EMAIL_FROM,

	FILE_DOWNLOAD_PATH: process.env.FILE_DOWNLOAD_PATH,

	COMPAT_API_KEY: process.env.COMPAT_API_KEY,
};

const parseResult = v.safeParse(envSchema, envPreParse);

if (parseResult.success === false) {
	throw new Error('env variables parse failed\n' + JSON.stringify(parseResult.issues, null, 2));
}

export const env = parseResult.output as Env;
