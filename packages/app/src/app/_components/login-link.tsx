'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { type ComponentProps } from 'react';

export function LoginLink(props: Omit<ComponentProps<typeof Link>, 'href'>) {
    return (
        <Link {...props} href={'/login'}>
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
