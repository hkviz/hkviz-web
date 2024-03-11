'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SubMenuLink({ children, href }: { children: React.ReactNode; href: string }) {
    const pathname = usePathname();
    return (
        <li>
            <Button variant="ghost" className={pathname === href ? 'bg-secondary' : ''} asChild>
                <Link href={href}>{children}</Link>
            </Button>
        </li>
    );
}
