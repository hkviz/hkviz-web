'use client';

import Link from 'next/link';

import {
    NavigationMenu,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { LogIn, Menu } from 'lucide-react';
import type { Session } from 'next-auth';
import { CurrentUserDropdown, CurrentUserHamburgerItems } from './current-user-dropdown';
import { HKVizText } from './hkviz-text';
import { LoginLink, useLoginUrl } from './login-link';
import { MenuEntryInHamburger, MenuEntryOutsideHamburger, linksLeft } from './main-nav-item';
import { ThemeSwitcher, type Theme } from './theme-switcher';

export function MainNav({ session, theme }: { session: Session | null; theme: Theme }) {
    const loginUrl = useLoginUrl();

    return (
        <div className="main-nav">
            <div className="main-nav-inner app-region-drag z-40 flex items-center justify-center bg-background">
                <NavigationMenu>
                    <NavigationMenuList className="app-region-no-drag">
                        <Link href="/" legacyBehavior passHref>
                            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                <HKVizText />
                            </NavigationMenuLink>
                        </Link>
                        {linksLeft.map((menuEntry) => (
                            <MenuEntryOutsideHamburger key={menuEntry.href} {...menuEntry} />
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>
                <div className="grow" />
                <NavigationMenu className="navigation-menu-content-from-right app-region-no-drag">
                    <ThemeSwitcher theme={theme} />
                    <NavigationMenuList>
                        {!session && (
                            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), 'hidden md:flex')} asChild>
                                <LoginLink />
                            </NavigationMenuLink>
                        )}
                        {session && <CurrentUserDropdown session={session} className="hidden md:flex" />}
                    </NavigationMenuList>
                    <Sheet>
                        <SheetTrigger asChild>
                            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), ' md:hidden')}>
                                <Menu className="h-5 w-5" />
                            </NavigationMenuLink>
                        </SheetTrigger>
                        <SheetContent className="overflow-y-auto">
                            <div className="flex flex-col gap-2 pt-4">
                                <MenuEntryInHamburger
                                    title={
                                        <span className="text-lg">
                                            <HKVizText />
                                        </span>
                                    }
                                    href="/"
                                />
                                {linksLeft.map((menuEntry) => (
                                    <MenuEntryInHamburger key={menuEntry.href} {...menuEntry} />
                                ))}
                                {session && <CurrentUserHamburgerItems session={session} />}
                                {!session && <MenuEntryInHamburger href={loginUrl} title="Login" icon={LogIn} />}
                            </div>
                        </SheetContent>
                    </Sheet>
                </NavigationMenu>
            </div>
        </div>
    );
}
