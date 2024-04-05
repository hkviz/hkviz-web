'use client';
import { Button } from '@/components/ui/button';
import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { SheetClose } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { NavigationMenuLink } from '@radix-ui/react-navigation-menu';
import { BadgeHelp, Globe, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';
import { ListItem } from './nav-list-item';

export interface MenuEntry {
    key: string;
    href: string | (({ pathname }: { pathname: string }) => string);
    title: ReactNode;
    description?: string;
    icon?: LucideIcon;
    isActive?: ({ pathname }: { pathname: string }) => boolean;
}

export const linksLeft: MenuEntry[] = [
    { key: 'public-runs', href: '/run', title: 'Public gameplays', icon: Globe },
    {
        key: 'guides',
        href: ({ pathname }) => {
            if (pathname.startsWith('/guide')) {
                return pathname;
            }
            if (pathname.startsWith('/run')) {
                return '/guide/analytics';
            }
            return '/guide/install';
        },
        title: "How to's",
        icon: BadgeHelp,
        isActive: ({ pathname }) => pathname.startsWith('/guide'),
    },
];

function useIsMenuEntryActive(menuEntry: Pick<MenuEntry, 'href' | 'isActive'>): boolean {
    const pathname = usePathname();
    return menuEntry.isActive ? menuEntry.isActive({ pathname }) : pathname === menuEntry.href;
}

function useMenuEntryHref(menuEntry: Pick<MenuEntry, 'href'>): string {
    const pathname = usePathname();
    return typeof menuEntry.href === 'function' ? menuEntry.href({ pathname }) : menuEntry.href;
}

const menuActiveClasses =
    'bg-primary bg-opacity-50 hover:bg-primary text-primary-foreground focus:bg-primary hover:text-primary-foreground focus:text-primary-foreground';

export function MenuEntryOutsideHamburger({ menuEntry }: { menuEntry: MenuEntry }) {
    const currentIsActive = useIsMenuEntryActive(menuEntry);
    const currentHref = useMenuEntryHref(menuEntry);
    const Icon = menuEntry.icon;
    return (
        <Link key={currentHref} href={currentHref} legacyBehavior passHref>
            <NavigationMenuLink
                className={cn(
                    navigationMenuTriggerStyle(),
                    'hidden md:flex ',
                    currentIsActive ? menuActiveClasses : undefined,
                )}
            >
                {Icon && <Icon className="mr-1 h-4 w-4" />}
                {menuEntry.title}
            </NavigationMenuLink>
        </Link>
    );
}

export function MenuEntryInHamburger({ menuEntry }: { menuEntry: MenuEntry }) {
    const currentIsActive = useIsMenuEntryActive(menuEntry);
    const currentHref = useMenuEntryHref(menuEntry);
    const Icon = menuEntry.icon;
    return (
        <Button
            key={currentHref}
            variant="ghost"
            asChild
            className={cn('justify-start px-4 py-6', currentIsActive ? menuActiveClasses : undefined)}
        >
            <SheetClose asChild>
                <Link href={currentHref}>
                    {Icon && <Icon className="mr-2 h-5 w-5" />}
                    {menuEntry.title}
                </Link>
            </SheetClose>
        </Button>
    );
}

export function MenuEntryListItem({ menuEntry }: { menuEntry: MenuEntry }) {
    const currentIsActive = useIsMenuEntryActive(menuEntry);
    const currentHref = useMenuEntryHref(menuEntry);
    return (
        <Link href={currentHref} legacyBehavior passHref>
            <ListItem
                title={menuEntry.title}
                Icon={menuEntry.icon}
                className={currentIsActive ? menuActiveClasses : undefined}
            >
                {menuEntry.description}
            </ListItem>
        </Link>
    );
}

export function SubMenuLink({ children, href }: { children: React.ReactNode; href: string }) {
    const pathname = usePathname();
    return (
        <li>
            <Button variant="ghost" className={pathname === href ? menuActiveClasses : ''} asChild>
                <Link href={href}>{children}</Link>
            </Button>
        </li>
    );
}
