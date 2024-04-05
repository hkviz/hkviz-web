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
    href: string | (({ pathname }: { pathname: string }) => string);
    title: ReactNode;
    description?: string;
    icon?: LucideIcon;
    isActive?: ({ pathname }: { pathname: string }) => boolean;
}

export const linksLeft: MenuEntry[] = [
    { href: '/run', title: 'Public gameplays', icon: Globe },
    {
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

const menuActiveStyle = 'bg-primary bg-opacity-50 hover:bg-primary focus:bg-primary';

export function MenuEntryOutsideHamburger({ href, title: text, icon: Icon, isActive }: MenuEntry) {
    const currentIsActive = useIsMenuEntryActive({ isActive, href });
    const currentHref = useMenuEntryHref({ href });
    return (
        <Link key={currentHref} href={currentHref} legacyBehavior passHref>
            <NavigationMenuLink
                className={cn(
                    navigationMenuTriggerStyle(),
                    'hidden md:flex ',
                    currentIsActive ? menuActiveStyle : undefined,
                )}
            >
                {Icon && <Icon className="mr-1 h-4 w-4" />}
                {text}
            </NavigationMenuLink>
        </Link>
    );
}

export function MenuEntryInHamburger({ href, title: text, icon: Icon, isActive }: MenuEntry) {
    const currentIsActive = useIsMenuEntryActive({ isActive, href });
    return (
        <Button
            key={href}
            variant="ghost"
            asChild
            className={cn('justify-start px-4 py-6', currentIsActive ? menuActiveStyle : undefined)}
        >
            <SheetClose asChild>
                <Link href={href}>
                    {Icon && <Icon className="mr-2 h-5 w-5" />}
                    {text}
                </Link>
            </SheetClose>
        </Button>
    );
}

export function MenuEntryListItem({ href, title, description, icon: Icon, isActive }: MenuEntry) {
    const currentIsActive = useIsMenuEntryActive({ isActive, href });
    return (
        <Link href={href} legacyBehavior passHref>
            <ListItem title={title} Icon={Icon} className={currentIsActive ? menuActiveStyle : undefined}>
                {description}
            </ListItem>
        </Link>
    );
}

export function SubMenuLink({ children, href }: { children: React.ReactNode; href: string }) {
    const pathname = usePathname();
    return (
        <li>
            <Button variant="ghost" className={pathname === href ? menuActiveStyle : ''} asChild>
                <Link href={href}>{children}</Link>
            </Button>
        </li>
    );
}
