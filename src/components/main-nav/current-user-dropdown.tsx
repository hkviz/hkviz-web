import { ArchiveIcon, ChevronDownIcon, LogOutIcon, SettingsIcon } from 'lucide-solid';
import { type Component } from 'solid-js';
import { Button } from '~/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { AuthSession } from '~/lib/auth/types';
import { createLogoutUrl } from '~/lib/auth/urls';
import { cn } from '~/lib/utils';
import { MenuItem, MenuItemContextProvider } from './main-nav-item';

export const CurrentUserNavLinks = () => {
	const logoutUrl = createLogoutUrl();
	return (
		<>
			<MenuItem href="/settings" title="Settings" icon={SettingsIcon} />
			<MenuItem href="/archive" title="Archived gameplays" icon={ArchiveIcon} />
			<MenuItem href={logoutUrl()} title="Logout" icon={LogOutIcon} useNativeLink={true} target="_self" />
		</>
	);
};

export const CurrentUserDropdown: Component<{
	session: AuthSession;
	class: string;
}> = (props) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				as={Button<'button'>}
				variant="ghost"
				class={cn('app-region-no-drag group', props.class)}
			>
				{props.session.user?.name ?? 'Account'}
				<ChevronDownIcon class="ml-1 h-4 w-4 transition-transform group-data-expanded:rotate-180" />
			</DropdownMenuTrigger>
			<DropdownMenuContent class="w-64">
				<MenuItemContextProvider
					value={{
						iconClass: 'mr-3 ml-2 h-5 w-5',
						buttonClass: 'h-12',
						as: DropdownMenuItem,
					}}
				>
					<CurrentUserNavLinks />
				</MenuItemContextProvider>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
