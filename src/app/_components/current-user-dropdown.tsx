'use client';

import { NavigationMenuContent, NavigationMenuItem, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { Session } from 'next-auth';
import Link from 'next/link';
import { ListItem } from './nav-list-item';

export function CurrentUserDropdown({ session }: { session: Session }) {
    return (
        <NavigationMenuItem>
            <NavigationMenuTrigger>{session.user.name}</NavigationMenuTrigger>
            <NavigationMenuContent>
                <ul className="grid w-[300px] gap-3 p-4 ">
                    {/*md:w-[500px] md:grid-cols-2 lg:w-[600px]*/}
                    <Link href="/api/auth/signout" legacyBehavior passHref>
                        <ListItem title="Logout">
                            Logout of {session.user.name}
                            {"'"}s account
                        </ListItem>
                    </Link>
                </ul>
            </NavigationMenuContent>
        </NavigationMenuItem>
    );
}
