import { storeInitializer as storeInitializerSolid } from '@hkviz/viz';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function useStoreInitializer() {
    const searchParams = useSearchParams();
    useState(() => storeInitializerSolid.initializeStores(searchParams));
}

export const storeInitializer = storeInitializerSolid;
