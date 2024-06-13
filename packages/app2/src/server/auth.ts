import DiscordProvider from '@auth/core/providers/discord';
import EmailProvider from '@auth/core/providers/nodemailer';
import GoogleProvider from '@auth/core/providers/google';
import { getSession, type SolidAuthConfig } from '@solid-mediakit/auth';
import { env } from '~/env';
import { isValid as isValidNonBlacklistedEmail } from 'mailchecker';
import { db } from '~/server/db';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { table } from './db/schema';
import { getWebRequest } from 'vinxi/http';
import { cache } from '@solidjs/router';

export const authOptions: SolidAuthConfig = {
    callbacks: {
        session: ({ session, user }) => ({
            ...session,
            user: {
                ...session.user,
                id: user.id,
            },
        }),
        // eslint-disable-next-line @typescript-eslint/require-await
        signIn: async ({ user }) => {
            if (user.email && !isValidNonBlacklistedEmail(user.email)) {
                return false;
            }
            return true;
        },
    },
    adapter: DrizzleAdapter(db, table),
    providers: [
        DiscordProvider({
            clientId: env.DISCORD_CLIENT_ID,
            clientSecret: env.DISCORD_CLIENT_SECRET,
        }),
        GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        }),
        EmailProvider({
            server: {
                host: env.EMAIL_SERVER_HOST,
                port: env.EMAIL_SERVER_PORT,
                auth: {
                    user: env.EMAIL_SERVER_USER,
                    pass: env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: env.EMAIL_FROM,
        }),
    ],
    theme: {
        logo: '/favicons/android-chrome-192x192.png',
        colorScheme: 'dark',
        brandColor: '#6d28d9',
    },
};

export type AccountType = 'discord' | 'google' | 'email';

const getSessionOrNull = cache(async () => {
    const request = getWebRequest();
    const session = await getSession(request, authOptions);
    return session;
}, 'session');

export async function getUserOrNull() {
    return (await getSessionOrNull())?.user ?? null;
}

export async function getUserOrThrow() {
    const user = await getUserOrNull();
    if (!user) {
        throw new Error('User not found');
    }
    return user;
}
