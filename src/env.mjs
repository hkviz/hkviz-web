import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
    /**
     * Specify your server-side environment variables schema here. This way you can ensure the app
     * isn't built with invalid env vars.
     */
    server: {
        TURSO_CONNECTION_URL: z
            .string()
            .url()
            .refine((str) => !str.includes('YOUR_MYSQL_URL_HERE'), 'You forgot to change the default URL'),
        TURSO_AUTH_TOKEN: z.string(),

        NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
        NEXTAUTH_SECRET: process.env.NODE_ENV === 'production' ? z.string() : z.string().optional(),
        NEXTAUTH_URL: z.preprocess(
            // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
            // Since NextAuth.js automatically uses the VERCEL_URL if present.
            (str) => process.env.VERCEL_URL ?? str,
            // VERCEL_URL doesn't include `https` so it cant be validated as a URL
            process.env.VERCEL ? z.string() : z.string().url(),
        ),
        // discord
        DISCORD_CLIENT_ID: z.string(),
        DISCORD_CLIENT_SECRET: z.string(),

        // google
        GOOGLE_CLIENT_ID: z.string(),
        GOOGLE_CLIENT_SECRET: z.string(),

        // r2
        R2_ACCESS_KEY_ID: z.string(),
        R2_SECRET_ACCESS_KEY: z.string(),
        R2_BUCKET_NAME: z.string(),
        R2_ACCOUNT_ID: z.string(),
        R2_ENDPOINT: z.string(),
        R2_PUBLIC_BUCKET_URL: z.string(),

        // mails
        EMAIL_SERVER_HOST: z.string(),
        EMAIL_SERVER_PORT: z.coerce.number(),
        EMAIL_SERVER_USER: z.string(),
        EMAIL_SERVER_PASSWORD: z.string(),
        EMAIL_FROM: z.string(),

        // aggregation pipeline
        FILE_DOWNLOAD_PATH: z.string(),
    },

    /**
     * Specify your client-side environment variables schema here. This way you can ensure the app
     * isn't built with invalid env vars. To expose them to the client, prefix them with
     * `NEXT_PUBLIC_`.
     */
    client: {
        // NEXT_PUBLIC_CLIENTVAR: z.string(),
    },

    /**
     * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
     * middlewares) or client-side so we need to destruct manually.
     */
    runtimeEnv: {
        TURSO_CONNECTION_URL: process.env.TURSO_CONNECTION_URL,
        TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,

        // discord
        DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
        DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,

        // google
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

        // r2
        R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
        R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
        R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
        R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
        R2_ENDPOINT: process.env.R2_ENDPOINT,
        R2_PUBLIC_BUCKET_URL: process.env.R2_PUBLIC_BUCKET_URL,

        // mails
        EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
        EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT,
        EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
        EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,
        EMAIL_FROM: process.env.EMAIL_FROM,

        FILE_DOWNLOAD_PATH: process.env.FILE_DOWNLOAD_PATH,
    },
    /**
     * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
     * useful for Docker builds.
     */
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
    /**
     * Makes it so that empty strings are treated as undefined.
     * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
     */
    emptyStringAsUndefined: true,
});
