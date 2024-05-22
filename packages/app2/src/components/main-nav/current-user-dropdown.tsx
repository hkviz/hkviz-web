import { Archive, LogOut, Settings } from 'lucide-solid';
import { type Component } from 'solid-js';
import { MenuItem, type MenuItemAs } from './main-nav-item';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@hkviz/components';

// TODO
type Session = 1;

export const CurrentUserNavLinks: Component<{ session: Session; as: MenuItemAs }> = (props) => {
    return (
        <>
            <MenuItem href="/settings" title="Settings" icon={Settings} as={props.as} />
            <MenuItem href="/archive" title="Archived gameplays" icon={Archive} as={props.as} />
            <MenuItem href="/api/auth/signout" title="Logout" icon={LogOut} as={props.as} />
        </>
    );
};

export const CurrentUserDropdown: Component<{ session: Session; class: string }> = (props) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger as={Button<'button'>}>TODO</DropdownMenuTrigger>
            <DropdownMenuContent class="w-48">
                <CurrentUserNavLinks session={props.session} as={DropdownMenuItem} />
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
