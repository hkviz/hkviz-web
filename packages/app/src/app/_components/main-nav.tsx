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
import { HKVizText } from './hkviz-text';
import { LoginLink } from './login-link';
import { MenuEntryInHamburger, MenuEntryOutsideHamburger, linksLeft } from './main-nav-item';
import { ThemeSwitcher, type Theme } from './theme-switcher';

export function MainNav({ theme }: { theme: Theme }) {
    return (
        <div className="main-nav">
            <div className="main-nav-inner app-region-drag bg-background z-40 flex items-center justify-center">
                <NavigationMenu>
                    <NavigationMenuList className="app-region-no-drag">
                        <Link href="/" legacyBehavior passHref>
                            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                <span className="text-lg">
                                    <HKVizText />
                                </span>
                            </NavigationMenuLink>
                        </Link>
                        {linksLeft.map((menuEntry) => (
                            <MenuEntryOutsideHamburger key={menuEntry.key} menuEntry={menuEntry} />
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>
                <div className="grow" />
                <NavigationMenu className="navigation-menu-content-from-right app-region-no-drag">
                    <ThemeSwitcher theme={theme} />
                    <NavigationMenuList>
                        <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), 'hidden md:flex')} asChild>
                            <LoginLink />
                        </NavigationMenuLink>
                    </NavigationMenuList>
                    <Sheet>
                        <SheetTrigger asChild>
                            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), ' md:hidden')} asChild>
                                <button>
                                    <Menu className="h-5 w-5" />
                                </button>
                            </NavigationMenuLink>
                        </SheetTrigger>
                        <SheetContent className="overflow-y-auto">
                            <div className="flex flex-col gap-2 pt-4">
                                <MenuEntryInHamburger
                                    menuEntry={{
                                        key: 'home',
                                        href: '/',
                                        title: (
                                            <span className="text-lg">
                                                <HKVizText />
                                            </span>
                                        ),
                                    }}
                                />
                                {linksLeft.map((menuEntry) => (
                                    <MenuEntryInHamburger key={menuEntry.key} menuEntry={menuEntry} />
                                ))}
                                <MenuEntryInHamburger
                                    menuEntry={{ key: 'login', href: '/login', title: 'Login', icon: LogIn }}
                                />
                            </div>
                        </SheetContent>
                    </Sheet>
                </NavigationMenu>
            </div>
        </div>
    );
}
