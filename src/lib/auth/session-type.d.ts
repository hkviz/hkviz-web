import '@auth/core/types';

export interface SessionUser {
	id: string;
	name?: string | null;
	email?: string | null;
	image?: string | null;
}

declare module '@auth/core/types' {
	export interface Session extends DefaultSession {
		user?: SessionUser;
	}
}
