import type { JSXElement } from 'solid-js';
import { createContext, createEffect, useContext } from 'solid-js';
import { assertNever } from '~/lib/util/other';
import { ContextMenuGroup, ContextMenuGroupLabel, ContextMenuRadioGroup, ContextMenuRadioItem } from './context-menu';
import {
	DropdownMenuGroup,
	DropdownMenuGroupLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
} from './dropdown-menu';

export type InteropMenuMode = 'dropdown' | 'context';

const InteropMenuContext = createContext<{
	mode: InteropMenuMode;
} | null>(null);

function useInteropMenuContext() {
	const context = useContext(InteropMenuContext);
	if (!context) {
		throw new Error('useInteropMenuContext must be used within an InteropMenu');
	}
	return context;
}

interface InteropMenuProps {
	mode: InteropMenuMode;
	children: JSXElement;
}

export function InteropMenu(props: InteropMenuProps) {
	// oxlint-disable-next-line solid/reactivity
	const initialMode = props.mode;
	createEffect(() => {
		if (props.mode !== initialMode) {
			console.warn('Changing InteropMenu mode is not supported');
		}
	});

	return <InteropMenuContext.Provider value={{ mode: initialMode }}>{props.children}</InteropMenuContext.Provider>;
}

export function InteropMenuGroup(props: { children: JSXElement }) {
	const mode = useInteropMenuContext().mode;
	if (mode === 'dropdown') {
		// oxlint-disable-next-line solid/components-return-once
		return <DropdownMenuGroup>{props.children}</DropdownMenuGroup>;
	} else if (mode === 'context') {
		// oxlint-disable-next-line solid/components-return-once
		return <ContextMenuGroup>{props.children}</ContextMenuGroup>;
	} else {
		// oxlint-disable-next-line solid/components-return-once
		return assertNever(mode);
	}
}

export function InteropMenuGroupLabel(props: { children: JSXElement }) {
	const mode = useInteropMenuContext().mode;
	if (mode === 'dropdown') {
		// oxlint-disable-next-line solid/components-return-once
		return <DropdownMenuGroupLabel>{props.children}</DropdownMenuGroupLabel>;
	} else if (mode === 'context') {
		// oxlint-disable-next-line solid/components-return-once
		return <ContextMenuGroupLabel>{props.children}</ContextMenuGroupLabel>;
	} else {
		// oxlint-disable-next-line solid/components-return-once
		return assertNever(mode);
	}
}

export function InteropMenuRadioGroup<T extends string>(props: {
	children: JSXElement;
	value: T;
	onChange: (value: T) => void;
}) {
	const mode = useInteropMenuContext().mode;
	if (mode === 'dropdown') {
		// oxlint-disable-next-line solid/components-return-once
		return (
			<DropdownMenuRadioGroup value={props.value} onChange={props.onChange}>
				{props.children}
			</DropdownMenuRadioGroup>
		);
	} else if (mode === 'context') {
		// oxlint-disable-next-line solid/components-return-once
		return (
			<ContextMenuRadioGroup value={props.value} onChange={props.onChange}>
				{props.children}
			</ContextMenuRadioGroup>
		);
	} else {
		// oxlint-disable-next-line solid/components-return-once
		return assertNever(mode);
	}
}

export function InteropMenuRadioItem(props: { children: JSXElement; value: string }) {
	const mode = useInteropMenuContext().mode;
	if (mode === 'dropdown') {
		// oxlint-disable-next-line solid/components-return-once
		return <DropdownMenuRadioItem value={props.value}>{props.children}</DropdownMenuRadioItem>;
	} else if (mode === 'context') {
		// oxlint-disable-next-line solid/components-return-once
		return <ContextMenuRadioItem value={props.value}>{props.children}</ContextMenuRadioItem>;
	} else {
		// oxlint-disable-next-line solid/components-return-once
		return assertNever(mode);
	}
}
