import { createAsync } from '@solidjs/router';
import type { Accessor, Component, JSXElement} from 'solid-js';
import { createContext, useContext } from 'solid-js';
import { raise } from '~/lib/parser';
import { getSessionOrNull } from './shared';
import type { AuthSession } from './types';

const SessionContext = createContext<Accessor<AuthSession | null>>();

export const SessionProvider: Component<{ children: JSXElement }> = (props) => {
	const session = createAsync(async () => await getSessionOrNull()); // session() ?? null

	return <SessionContext.Provider value={() => session() ?? null}>{props.children}</SessionContext.Provider>;
};

export const useSession = () => {
	return useContext(SessionContext) ?? raise(new Error('SessionProvider not found'));
};
export const useUser = () => {
	const session = useSession();
	return () => session()?.user;
};
