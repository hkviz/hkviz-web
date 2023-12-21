'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ComponentProps } from 'react';

export function LoginLink(props: Omit<ComponentProps<typeof Link>, 'href'>) {
    const pathName = usePathname();
    return (
        <Link {...props} href={'/api/auth/signin?callbackUrl=' + pathName}>
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
