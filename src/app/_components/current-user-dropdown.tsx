'use client';

import { NavigationMenuContent, NavigationMenuItem, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { Archive, LogOut, Settings } from 'lucide-react';
import type { Session } from 'next-auth';
import Link from 'next/link';
import { ListItem } from './nav-list-item';

export function CurrentUserDropdown({ session }: { session: Session }) {
    return (
        <NavigationMenuItem>
            <NavigationMenuTrigger>{session.user.name ?? 'Logged in'}</NavigationMenuTrigger>
            <NavigationMenuContent>
                <ul className="grid w-[350px] gap-3 p-4">
                    {/*md:w-[500px] md:grid-cols-2 lg:w-[600px]*/}
                    <Link href="/settings" legacyBehavior passHref>
                        <ListItem title="Settings" Icon={Settings}>
                            Manage your account settings and study consent
                        </ListItem>
                    </Link>
                    <Link href="/archive" legacyBehavior passHref>
                        <ListItem title="Archived gameplays" Icon={Archive}>
                            Unarchive and view your archived gameplays
                        </ListItem>
                    </Link>
                    <Link href="/api/auth/signout" legacyBehavior passHref>
                        <ListItem title="Logout" Icon={LogOut}>
                            Logout of {session.user.name ? session.user.name + "'s" : 'your'} account
                        </ListItem>
                    </Link>
                </ul>
            </NavigationMenuContent>
        </NavigationMenuItem>
    );
}
