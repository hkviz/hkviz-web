import { createContext, createSignal, createUniqueId, useContext, type JSXElement } from 'solid-js';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

export const ImageAreaShadowContext = createContext<{
	set?: (positionClassName: string) => void;
	unset?: (positionClassName: string) => void;
	isCurrent?: (positionClassName: string) => boolean;
}>({});

export function ImageAreaShadow(props: { children: JSXElement }) {
	const [positionClassName, setPositionClassName] = createSignal<string | null>(null);

	function unsetPositionClassName(className: string) {
		setPositionClassName((value) => (value === className ? null : value));
	}
	const contextValue = {
		set: setPositionClassName,
		unset: unsetPositionClassName,
		isCurrent: (className: string) => positionClassName() === className,
	};

	return (
		<ImageAreaShadowContext.Provider value={contextValue}>
			<div class="absolute inset-0 overflow-hidden rounded-md">
				<div
					class={
						'pointer-events-none absolute rounded-md shadow-[0_0_0_100vmax_rgba(0,0,0,0.5)] transition-all duration-100 dark:shadow-[0_0_0_100vmax_rgba(255,255,255,0.35)] ' +
						(positionClassName() ?? 'left-0 top-0 h-full w-full delay-150')
					}
				></div>
			</div>
			{props.children}
		</ImageAreaShadowContext.Provider>
	);
}

export function ImageArea(props: { positionClass: string; children: JSXElement; href: string }) {
	const context = useContext(ImageAreaShadowContext);
	const id = createUniqueId();

	const isCurrent = () => context.isCurrent?.(props.positionClass) ?? false;

	function handleHover() {
		context.set?.(props.positionClass);
	}

	function handleUnhover() {
		context.unset?.(props.positionClass);
	}

	return (
		<div>
			{' '}
			<Button
				class={cn(
					'peer absolute min-h-0 min-w-0 rounded-sm border-2 border-dashed border-black bg-transparent p-0 no-underline opacity-30 drop-shadow-glow-md transition duration-200 ease-in-out hover:bg-transparent hover:bg-opacity-0 group-hover:opacity-100 dark:border-white',
					// 'absolute z-20 rounded-sm border-2 border-red-600 bg-transparent p-0 text-transparent no-underline drop-shadow-glow-md transition duration-200 ease-in-out hover:bg-transparent hover:bg-opacity-0 group-hover:text-red-600 group-hover:opacity-100 dark:border-red-600 dark:drop-shadow-2xl dark:group-hover:text-red-600',
					props.positionClass,
				)}
				onFocus={handleHover}
				onBlur={handleUnhover}
				onMouseEnter={handleHover}
				onMouseLeave={handleUnhover}
				aria-describedby={'tooltip' + id}
				as={'a'}
				href={props.href}
			/>
			<span
				id={'tooltip' + id}
				class={
					'pointer-events-none absolute left-[50%] top-[.15rem] z-20 w-max translate-x-[-50%] rounded-md border bg-popover px-3 py-2 text-center text-sm text-popover-foreground shadow-md transition ' +
					(isCurrent() ? 'scale-100 opacity-100' : 'scale-90 opacity-0')
				}
			>
				{props.children}
			</span>
		</div>
	);
}
