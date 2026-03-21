import { A, useBeforeLeave, useLocation } from '@solidjs/router';
import { BadgeQuestionMarkIcon, BookOpenIcon, GlobeIcon, LogInIcon, MenuIcon } from 'lucide-solid';
import { ErrorBoundary, Show, Suspense, createMemo, type Component } from 'solid-js';
import { createLoginUrl } from '~/lib/auth/urls';
// import { useSession } from '~/lib/auth/client';
import { useSession } from '~/lib/auth/client';
import { cn } from '~/lib/utils';
import { useUiStore } from '~/lib/viz/store/ui-store';
import { useViewportStore } from '~/lib/viz/store/viewport-store';
import { HKVizText } from '../HKVizText';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { CurrentUserDropdown, CurrentUserNavLinks } from './current-user-dropdown';
import { MainNavAccountDeletionWarning } from './main-nav-account-delete-warning';
import { MenuItem, MenuItemContextProvider } from './main-nav-item';
import { ThemeSwitcher } from './theme-switcher';

export const MainNavLeftSide: Component = () => {
	return (
		<>
			<MenuItem href="/run" title="Public gameplays" icon={GlobeIcon} />
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
				icon={BadgeQuestionMarkIcon}
				isActive={({ pathname }) => pathname.startsWith('/guide')}
			/>
			<MenuItem href="/research" title="Research" icon={BookOpenIcon} />
		</>
	);
};

export const MainNav = () => {
	const session = useSession();
	const loginUrl = createLoginUrl();
	const uiStore = useUiStore();
	const viewportStore = useViewportStore();

	const location = useLocation();
	const isVisible = createMemo(
		() =>
			uiStore.mobileTab() === 'overview' ||
			!location.pathname.startsWith('/run/') ||
			!viewportStore.isSmallMobileLayout(),
	);

	const open = uiStore.isMenuOpen;
	const setOpen = uiStore.setIsMenuOpen;

	useBeforeLeave(() => {
		setOpen(false);
	});

	return (
		<div class={cn('main-nav', isVisible() ? '' : 'main-nav-hidden')}>
			<div class="main-nav-inner app-region-drag bg-background z-40 flex items-center justify-center">
				<Button as={A} class="app-region-no-drag" href="/" variant="ghost">
					<span class="text-lg">
						<HKVizText />
					</span>
				</Button>

				<MenuItemContextProvider value={{ buttonClass: 'hidden md:inline-flex' }}>
					<MainNavLeftSide />
				</MenuItemContextProvider>
				<div class="grow" />
				<ErrorBoundary fallback={<div>Loading login failed</div>}>
					<Suspense fallback={<></>}>
						<div class="hidden md:inline-flex">
							<MainNavAccountDeletionWarning />
						</div>
						<ErrorBoundary fallback={<div>Theme switcher error</div>}>
							<ThemeSwitcher />
						</ErrorBoundary>
						<Show
							when={session()}
							fallback={
								<Button
									as={'a'}
									href={loginUrl()}
									variant="ghost"
									class="app-region-no-drag hidden md:inline-flex"
									target="_self"
								>
									Login
								</Button>
							}
						>
							{(session) => <CurrentUserDropdown session={session()} class="hidden md:inline-flex" />}
						</Show>
					</Suspense>
				</ErrorBoundary>
				<Sheet open={open()} onOpenChange={setOpen}>
					<SheetTrigger as={Button<'button'>} variant="ghost" class="app-region-no-drag md:hidden">
						<MenuIcon class="h-5 w-5" />
					</SheetTrigger>
					<SheetContent position="right">
						<MenuItemContextProvider
							value={{
								titleClass: 'grow',
								iconClass: 'mr-4 h-5 w-5',
								buttonClass: 'h-12',
							}}
						>
							<div class="app-region-no-drag flex h-full flex-col gap-1">
								<Button as={A} href="/" variant="ghost" class="h-16 justify-start">
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
											icon={LogInIcon}
											useNativeLink={true}
											target="_self"
										/>
									}
								>
									<CurrentUserNavLinks />
								</Show>
								<MainNavAccountDeletionWarning />

								<div class="grow" />
								<div class="flex flex-row">
									<ErrorBoundary fallback={<div>Theme switcher error</div>}>
										<ThemeSwitcher />
									</ErrorBoundary>
								</div>
							</div>
						</MenuItemContextProvider>
					</SheetContent>
				</Sheet>
			</div>
		</div>
	);
};
