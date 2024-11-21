import { useAuth } from "@solid-mediakit/auth/client";
import { A, useBeforeLeave } from "@solidjs/router";
import { BadgeHelp, Globe, LogIn, Menu } from "lucide-solid";
import {
  ErrorBoundary,
  Show,
  Suspense,
  createSignal,
  type Component,
} from "solid-js";
import { createLoginUrl } from "~/lib/auth-urls";
import { HKVizText } from "../HKVizText";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import {
  CurrentUserDropdown,
  CurrentUserNavLinks,
} from "./current-user-dropdown";
import { MenuItem, MenuItemContextProvider } from "./main-nav-item";
import { ThemeSwitcher, type Theme } from "./theme-switcher";

export const MainNavLeftSide: Component = () => {
  return (
    <>
      <MenuItem href="/run" title="Public gameplays" icon={Globe} />
      <MenuItem
        href={({ pathname }) => {
          if (pathname.startsWith("/guide")) {
            return pathname;
          }
          if (pathname.startsWith("/run/")) {
            return "/guide/analytics";
          }
          return "/guide/install";
        }}
        title="How to's"
        icon={BadgeHelp}
        isActive={({ pathname }) => pathname.startsWith("/guide")}
      />
    </>
  );
};

export const MainNav: Component<{ theme: Theme }> = (props) => {
  const session = useAuth().session;
  const loginUrl = createLoginUrl();

  const [open, setOpen] = createSignal(false);

  useBeforeLeave(() => {
    setOpen(false);
  });

  return (
    <div class="main-nav">
      <div class="main-nav-inner app-region-drag bg-background z-40 flex items-center justify-center">
        <Button as={A} class="app-region-no-drag" href="/" variant="ghost">
          <span class="text-lg">
            <HKVizText />
          </span>
        </Button>

        <MenuItemContextProvider
          value={{ buttonClass: "hidden md:inline-flex" }}
        >
          <MainNavLeftSide />
        </MenuItemContextProvider>
        <div class="grow" />
        <ErrorBoundary fallback={<div>Loading login failed</div>}>
          <Suspense fallback={<></>}>
            <ThemeSwitcher />
            <Show
              when={session()}
              fallback={
                <Button
                  as={"a"}
                  href={loginUrl()}
                  variant="ghost"
                  class="hidden md:inline-flex"
                >
                  Login
                </Button>
              }
            >
              {(session) => (
                <CurrentUserDropdown
                  session={session()}
                  class="hidden md:inline-flex"
                />
              )}
            </Show>
          </Suspense>
        </ErrorBoundary>
        <Sheet open={open()} onOpenChange={setOpen}>
          <SheetTrigger as={Button<"button">} variant="ghost" class="md:hidden">
            <Menu class="h-5 w-5" />
          </SheetTrigger>
          <SheetContent position="right">
            <MenuItemContextProvider
              value={{
                titleClass: "grow",
                iconClass: "mr-4 h-5 w-5",
                buttonClass: "h-12",
              }}
            >
              <div class="app-region-no-drag flex flex-col gap-1">
                <Button
                  as={A}
                  href="/"
                  variant="ghost"
                  class="h-16 justify-start"
                >
                  <span class="text-2xl">
                    <HKVizText />
                  </span>
                </Button>
                <MainNavLeftSide />
                <Show
                  when={session()}
                  fallback={
                    <MenuItem
                      href={loginUrl()}
                      title="Login"
                      icon={LogIn}
                      useNativeLink={true}
                    />
                  }
                >
                  {(session) => <CurrentUserNavLinks session={session()} />}
                </Show>
              </div>
            </MenuItemContextProvider>
          </SheetContent>
        </Sheet>
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
