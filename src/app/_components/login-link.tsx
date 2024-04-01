'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ComponentProps } from 'react';

export function useLoginUrl() {
    return '/api/auth/signin?callbackUrl=' + usePathname();
}

export function LoginLink(props: Omit<ComponentProps<typeof Link>, 'href'>) {
    const loginUrl = useLoginUrl();
    return (
        <Link {...props} href={loginUrl}>
            Login
        </Link>
    );
}

export function LoginButton() {
    return (
        <Button asChild>
            <LoginLink />
        </Button>
    );
}
