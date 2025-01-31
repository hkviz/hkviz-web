import { createAsync } from '@solidjs/router';
import { Accessor, Component, createContext, JSXElement, useContext } from 'solid-js';
import { raise } from '~/lib/parser';
import { getSessionOrNull } from './shared';
import { AuthSession } from './types';

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
