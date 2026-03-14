import { For, JSXElement, type Component } from 'solid-js';
import { cn } from '~/lib/utils';

interface ShortcutHintProps {
	keys: string | string[];
	before?: JSXElement;
	after?: JSXElement;
	class?: string;
}

export const ShortcutHint: Component<ShortcutHintProps> = (props) => {
	return (
		<div class={cn('text-muted-foreground mt-2 flex items-center gap-1.5 text-xs', props.class)}>
			{props.before && <span>{props.before}</span>}
			<ShortcutKeys keys={props.keys} />
			{props.after && <span>{props.after}</span>}
		</div>
	);
};

export const CtrlOrCommandKeyText: Component = () => {
	const isMac = typeof window !== 'undefined' ? /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent) : false;
	const ctrlKey = isMac ? '⌘' : 'Ctrl';
	return <span>{ctrlKey}</span>;
};

export const ShortcutKeys: Component<{ keys: JSXElement | JSXElement[]; class?: string }> = (props) => {
	const keys = () => (Array.isArray(props.keys) ? props.keys : [props.keys]);

	return (
		<For each={keys()}>
			{(key, i) => (
				<>
					{i() > 0 && <span class="px-0.5 text-sm opacity-75">+</span>}
					<ShortcutKey>{key}</ShortcutKey>
				</>
			)}
		</For>
	);
};

export const ShortcutKey: Component<{ class?: string; children: JSXElement }> = (props) => {
	return (
		<kbd class={cn('bg-muted text-foreground rounded border px-1.5 py-0.5 text-[11px] font-medium', props.class)}>
			{props.children}
		</kbd>
	);
};
