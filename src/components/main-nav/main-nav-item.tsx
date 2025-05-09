import { Button } from '~/components/ui/button';
import { DropdownMenuItem } from '~/components/ui/dropdown-menu';
import { A, useLocation } from '@solidjs/router';
import { type LucideIcon } from 'lucide-solid';
import { Show, createContext, useContext, type Component, type JSXElement } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { cn } from '~/lib/utils';

export type MenuItemAs = typeof Button | typeof DropdownMenuItem;

interface MenuItemContextValue {
	iconClass?: string;
	buttonClass?: string;
	titleClass?: string;
	as?: MenuItemAs;
}
const MenuItemContext = createContext<MenuItemContextValue>({});

export const MenuItemContextProvider = (props: { value: MenuItemContextValue; children: JSXElement }) => {
	// eslint-disable-next-line solid/reactivity
	return <MenuItemContext.Provider value={props.value}>{props.children}</MenuItemContext.Provider>;
};

export interface MenuItemProps {
	href?: string | (({ pathname }: { pathname: string }) => string);
	useNativeLink?: boolean;
	onClick?: () => void;
	title: JSXElement;
	icon?: LucideIcon;
	isActive?: ({ pathname }: { pathname: string }) => boolean;
	class?: string;
	target?: string;
}

export const MenuItem: Component<MenuItemProps> = (props) => {
	const context = useContext(MenuItemContext)!;

	// todo
	const location = useLocation();
	const currentIsActive = () => props.isActive?.({ pathname: location.pathname }) ?? props.href === location.pathname;

	const href = () => (typeof props.href === 'function' ? props.href({ pathname: location.pathname }) : props.href);

	const content = (
		<>
			<Show when={props.icon}>
				<Dynamic component={props.icon} class={cn('mr-1 h-4 w-4', context.iconClass)} />
			</Show>
			<span class={context.titleClass}>{props.title}</span>
		</>
	);

	return (
		<Dynamic
			component={context.as ?? Button}
			as={!href() ? 'button' : props.useNativeLink ? 'a' : A}
			href={href()}
			target={props.target}
			onClick={props.onClick}
			variant={currentIsActive() ? 'default' : 'ghost'}
			class={'app-region-no-drag ' + context.buttonClass}
		>
			{content}
		</Dynamic>

		// <SheetClose
		//     as={() => (

		//         )}
		//     />
	);
};
