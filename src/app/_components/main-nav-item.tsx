import { Button } from '@/components/ui/button';
import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { SheetClose } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { NavigationMenuLink } from '@radix-ui/react-navigation-menu';
import { BadgeHelp, Globe, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';
import { ListItem } from './nav-list-item';

export interface MenuEntry {
    href: string;
    title: ReactNode;
    description?: string;
    icon?: LucideIcon;
}

export const linksLeft: MenuEntry[] = [
    { href: '/run', title: 'Public gameplays', icon: Globe },
    { href: '/guide/install', title: "How to's", icon: BadgeHelp },
];

export function MenuEntryOutsideHamburger({ href, title: text, icon: Icon }: MenuEntry) {
    return (
        <Link key={href} href={href} legacyBehavior passHref>
            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), 'hidden md:flex')}>
                {Icon && <Icon className="mr-1 h-4 w-4" />}
                {text}
            </NavigationMenuLink>
        </Link>
    );
}

export function MenuEntryInHamburger({ href, title: text, icon: Icon }: MenuEntry) {
    return (
        <Button key={href} variant="ghost" asChild className="justify-start px-4 py-6">
            <SheetClose asChild>
                <Link href={href}>
                    {Icon && <Icon className="mr-2 h-5 w-5" />}
                    {text}
                </Link>
            </SheetClose>
        </Button>
    );
}

export function MenuEntryListItem({ href, title, description, icon: Icon }: MenuEntry) {
    return (
        <Link href={href} legacyBehavior passHref>
            <ListItem title={title} Icon={Icon}>
                {description}
            </ListItem>
        </Link>
    );
}
