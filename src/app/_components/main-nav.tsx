'use client';

import Link from 'next/link';

import {
    NavigationMenu,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import type { Session } from 'next-auth';
import { CurrentUserDropdown } from './current-user-dropdown';
import { HKVizText } from './hkviz-text';
import { LoginLink } from './login-link';
import { ThemeSwitcher, type Theme } from './theme-switcher';

export function MainNav({ session, theme }: { session: Session | null; theme: Theme }) {
    return (
        <div className="main-nav">
            <div className="main-nav-inner app-region-drag z-[90] flex items-center justify-center bg-background">
                <NavigationMenu>
                    <NavigationMenuList className="app-region-no-drag">
                        <Link href="/" legacyBehavior passHref>
                            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                <HKVizText />
                            </NavigationMenuLink>
                        </Link>
                        {/* <NavigationMenuItem>
                            <NavigationMenuTrigger chevronClassName="hidden">
                                <MatSymbol icon="more_vert" />
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid w-[350px] gap-3 p-4">
                                    <Link href="/settings" legacyBehavior passHref>
                                        <ListItem title="Settings"></ListItem>
                                    </Link>
                                    <Link href="/api/auth/signout" legacyBehavior passHref>
                                        <ListItem title="Logout" />
                                    </Link>
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem> */}

                        {/* {session && (
                        <Link href="/upload" legacyBehavior passHref>
                            <NavigationMenuLink className={navigationMenuTriggerStyle()}>Upload run</NavigationMenuLink>
                        </Link>
                    )} */}
                    </NavigationMenuList>
                </NavigationMenu>
                <div className="grow" />
                <NavigationMenu className="navigation-menu-content-from-right app-region-no-drag">
                    <ThemeSwitcher theme={theme} />
                    <NavigationMenuList>
                        {!session && (
                            <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                                <LoginLink />
                            </NavigationMenuLink>
                        )}
                        {session && <CurrentUserDropdown session={session} />}
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
        </div>
    );
}
