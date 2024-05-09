'use client';

import { NavigationMenuContent, NavigationMenuItem, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { Archive, LogOut, Settings } from 'lucide-react';
import type { Session } from 'next-auth';
import { memo } from 'react';
import { MenuEntryInHamburger, MenuEntryListItem, type MenuEntry } from './main-nav-item';

function userDropdownMenuEntries(session: Session): MenuEntry[] {
    return [
        {
            key: 'settings',
            href: '/settings',
            title: 'Settings',
            description: 'Manage your account settings and study consent',
            icon: Settings,
        },
        {
            key: 'archive',
            href: '/archive',
            title: 'Archived gameplays',
            description: 'Unarchive and view your archived gameplays',
            icon: Archive,
        },
        {
            key: 'logout',
            href: '/api/auth/signout',
            title: 'Logout',
            description: `Logout of ${session.user.name ?? 'your'} account`,
            icon: LogOut,
        },
    ];
}

export const CurrentUserDropdown = memo(function CurrentUserDropdown({
    session,
    className,
}: {
    session: Session;
    className: string;
}) {
    const menuEntries = userDropdownMenuEntries(session);
    return (
        <NavigationMenuItem>
            <NavigationMenuTrigger className={className}>{session.user.name ?? 'Logged in'}</NavigationMenuTrigger>
            <NavigationMenuContent>
                <ul className="grid w-[350px] gap-3 p-4">
                    {menuEntries.map((menuEntry) => (
                        <MenuEntryListItem key={menuEntry.key} menuEntry={menuEntry} />
                    ))}
                </ul>
            </NavigationMenuContent>
        </NavigationMenuItem>
    );
});

export const CurrentUserHamburgerItems = memo(function CurrentUserHamburgerItems({ session }: { session: Session }) {
    const menuEntries = userDropdownMenuEntries(session);
    return (
        <>
            {menuEntries.map((menuEntry) => (
                <MenuEntryInHamburger key={menuEntry.key} menuEntry={menuEntry} />
            ))}
        </>
    );
});
