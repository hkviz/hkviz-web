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
import { type Theme, ThemeSwitcher } from './theme-switcher';
import { LoginLink } from './login-link';

export function MainNav({ session, theme }: { session: Session | null; theme: Theme }) {
    return (
        <div className="main-nav">
            <div className="main-nav-inner app-region-drag z-[90] flex items-center justify-center bg-background">
                <NavigationMenu>
                    <NavigationMenuList className="app-region-no-drag">
                        <Link href="/" legacyBehavior passHref>
                            <NavigationMenuLink className={navigationMenuTriggerStyle()}>HKViz</NavigationMenuLink>
                        </Link>
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
