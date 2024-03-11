'use client';

import { RedirectType, redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
    useEffect(() => {
        redirect('/guide/install' + location.hash, RedirectType.replace);
    }, []);
    return <div></div>;
}
