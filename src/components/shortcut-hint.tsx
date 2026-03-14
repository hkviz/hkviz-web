import { For, JSXElement, type Component } from 'solid-js';
import { cn } from '~/lib/utils';

interface ShortcutHintProps {
	keys: string | string[];
	before?: JSXElement;
	after?: JSXElement;
	class?: string;
}

export const ShortcutHint: Component<ShortcutHintProps> = (props) => {
	const keys = () => (Array.isArray(props.keys) ? props.keys : [props.keys]);

	return (
		<div class={cn('text-muted-foreground mt-2 flex items-center gap-1.5 text-xs', props.class)}>
			{props.before && <span>{props.before}</span>}
			<For each={keys()}>
				{(key, i) => (
					<>
						{i() > 0 && <span>+</span>}
						<ShortcutKey>{key}</ShortcutKey>
					</>
				)}
			</For>
			{props.after && <span>{props.after}</span>}
		</div>
	);
};

export const ShortcutKey: Component<{ class?: string; children: JSXElement }> = (props) => {
	return (
		<kbd class={cn('bg-muted text-foreground rounded border px-1.5 py-0.5 text-[11px] font-medium', props.class)}>
			{props.children}
		</kbd>
	);
};
