import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    cn,
} from '@hkviz/components';
import { type Session } from '@solid-mediakit/auth';
import { Archive, ChevronDown, LogOut, Settings } from 'lucide-solid';
import { type Component } from 'solid-js';
import { createLogoutUrl } from '~/lib/auth-urls';
import { MenuItem, MenuItemContextProvider } from './main-nav-item';

export const CurrentUserNavLinks: Component<{ session: Session }> = (props) => {
    const logoutUrl = createLogoutUrl();
    return (
        <>
            <MenuItem href="/settings" title="Settings" icon={Settings} />
            <MenuItem href="/archive" title="Archived gameplays" icon={Archive} />
            <MenuItem href={logoutUrl()} title="Logout" icon={LogOut} useNativeLink={true} />
        </>
    );
};

export const CurrentUserDropdown: Component<{ session: Session; class: string }> = (props) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger as={Button<'button'>} variant="ghost" class={cn('group', props.class)}>
                {props.session.user?.name ?? 'Account'}
                <ChevronDown class="ml-1 h-4 w-4 transition-transform group-data-[expanded]:rotate-180" />
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-64">
                <MenuItemContextProvider
                    value={{
                        iconClass: 'mr-3 ml-2 h-5 w-5',
                        buttonClass: 'h-12',
                        as: DropdownMenuItem,
                    }}
                >
                    <CurrentUserNavLinks session={props.session} />
                </MenuItemContextProvider>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
