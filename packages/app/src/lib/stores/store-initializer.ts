import { type DisplayVersion, storeInitializer as storeInitializerSolid } from '@hkviz/viz';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function useStoreInitializer() {
    const searchParams = useSearchParams();

    const version: DisplayVersion = searchParams.get('v') === '1' ? 'v1' : 'vnext';

    useState(() => storeInitializerSolid.initializeStores(version));
}
