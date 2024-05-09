'use client';

import { RedirectType, redirect } from 'next/navigation';
import { useEffect } from 'react';

export function ClientRedirect() {
    useEffect(() => {
        redirect('/guide/install' + location.hash, RedirectType.replace);
    }, []);
    return <div></div>;
}
