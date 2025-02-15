import DiscordProvider from '@auth/core/providers/discord';
import GoogleProvider from '@auth/core/providers/google';
import EmailProvider from '@auth/core/providers/nodemailer';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { type SolidAuthConfig } from '@auth/solid-start';
import { isValid as isValidNonBlacklistedEmail } from 'mailchecker';
import { env } from '~/env';
import { db } from '~/server/db';
import { accounts, sessions, users, verificationTokens } from '~/server/db/schema';

export const authOptions: SolidAuthConfig = {
	basePath: '/api/auth',
	callbacks: {
		session: ({ session, user }) => ({
			...session,
			user: {
				...session.user,
				id: user.id,
			},
		}),
		 
		signIn: async ({ user }) => {
			if (user.email && !isValidNonBlacklistedEmail(user.email)) {
				return false;
			}
			return true;
		},
	},
	adapter: DrizzleAdapter(db, {
		usersTable: users,
		accountsTable: accounts,
		sessionsTable: sessions,
		verificationTokensTable: verificationTokens,
	}),
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
