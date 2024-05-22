import { Button, type DropdownMenuItem, SheetClose } from '@hkviz/components';
import { A, useLocation } from '@solidjs/router';
import { type LucideIcon } from 'lucide-solid';
import { Show, type Component, type JSXElement } from 'solid-js';
import { Dynamic } from 'solid-js/web';

export type MenuItemAs = typeof Button | typeof DropdownMenuItem;

export interface MenuItemProps {
    as?: MenuItemAs;
    href: string | (({ pathname }: { pathname: string }) => string);
    title: JSXElement;
    icon?: LucideIcon;
    isActive?: ({ pathname }: { pathname: string }) => boolean;
}

export const MenuItem: Component<MenuItemProps> = (props) => {
    // todo
    const location = useLocation();
    const currentIsActive = () => props.isActive?.({ pathname: location.pathname }) ?? props.href === location.pathname;

    const href = () => (typeof props.href === 'function' ? props.href({ pathname: location.pathname }) : props.href);

    return (
        // <SheetClose
        //     as={() => (
        <Button as={A} href={href()} variant={currentIsActive() ? 'default' : 'ghost'}>
            <Show when={props.icon}>
                <Dynamic component={props.icon} class="mr-1 h-4 w-4" />
            </Show>
            {props.title}
        </Button>
        //         )}
        //     />
    );
};
