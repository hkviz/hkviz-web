'use client';

import { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { store } from '~/lib/store/store';

type P = PropsWithChildren;

export default function ClientContext({ children }: P) {
    return <Provider store={store}>{children}</Provider>;
}
