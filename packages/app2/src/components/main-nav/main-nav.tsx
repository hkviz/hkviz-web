'use client';

import { Button } from '@hkviz/components';
import { HKVizText } from '@hkviz/viz-ui';
import { BadgeHelp, Globe } from 'lucide-solid';
import { Show, type Component } from 'solid-js';
import { createLoginUrl } from '../login-link';
import { ThemeSwitcher, type Theme } from './theme-switcher';
import { CurrentUserDropdown } from './current-user-dropdown';
import { MenuItem } from './main-nav-item';
import { A } from '@solidjs/router';

export const MainNavLeftSide: Component = () => {
    return (
        <>
            <MenuItem href="/run" title="Public gameplays" icon={Globe} />
            <MenuItem
                href={({ pathname }) => {
                    if (pathname.startsWith('/guide')) {
                        return pathname;
                    }
                    if (pathname.startsWith('/run/')) {
                        return '/guide/analytics';
                    }
                    return '/guide/install';
                }}
                title="How to's"
                icon={BadgeHelp}
                isActive={({ pathname }) => pathname.startsWith('/guide')}
            />
        </>
    );
};

// TODO
type Session = { user: { name: string } };

export const MainNav: Component<{ session: Session | null; theme: Theme }> = (props) => {
    const loginUrl = createLoginUrl();

    return (
        <div class="main-nav">
            <div class="main-nav-inner app-region-drag bg-background z-40 flex items-center justify-center">
                <Button as={A} class="app-region-no-drag" href="/" variant="ghost">
                    <span class="text-lg">
                        <HKVizText />
                    </span>
                </Button>

                <MainNavLeftSide />
                <div class="grow" />
                <ThemeSwitcher />
                <Show
                    when={props.session}
                    fallback={
                        <Button as={A} href={loginUrl()} variant="ghost">
                            Login
                        </Button>
                    }
                >
                    {(session) => <CurrentUserDropdown session={1} class="hidden md:flex" />}
                </Show>
                {/* <Sheet>
                        <SheetTrigger asChild>
                            <NavigationMenuLink class={cn(navigationMenuTriggerStyle(), ' md:hidden')} asChild>
                                <button>
                                    <Menu class="h-5 w-5" />
                                </button>
                            </NavigationMenuLink>
                        </SheetTrigger>
                        <SheetContent class="overflow-y-auto">
                            <div class="flex flex-col gap-2 pt-4">
                                <MenuEntryInHamburger
                                    menuEntry={{
                                        key: 'home',
                                        href: '/',
                                        title: (
                                            <span class="text-lg">
                                                <HKVizText />
                                            </span>
                                        ),
                                    }}
                                />
                                {linksLeft.map((menuEntry) => (
                                    <MenuEntryInHamburger key={menuEntry.key} menuEntry={menuEntry} />
                                ))}
                                {session && <CurrentUserHamburgerItems session={session} />}
                                {!session && (
                                    <MenuEntryInHamburger
                                        menuEntry={{ key: 'login', href: loginUrl, title: 'Login', icon: LogIn }}
                                    />
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </NavigationMenu> */}
            </div>
        </div>
    );
};
