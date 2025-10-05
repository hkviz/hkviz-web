import { type Component } from 'solid-js';
import { cn } from '~/lib/utils';
import { Separator } from '../separator';

export const GradientSeparator: Component<{ class?: string }> = (props) => {
	return (
		<Separator
			class={cn(
				'my-4 h-px border-none bg-transparent bg-linear-to-r from-transparent via-foreground to-transparent',
				props.class,
			)}
		/>
	);
};
