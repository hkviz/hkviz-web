import { cn } from '~/lib/utils';
import { type Component } from 'solid-js';
import { Separator } from '../separator';

export const GradientSeparator: Component<{ class?: string }> = (props) => {
	return (
		<Separator
			class={cn(
				'my-4 h-px border-none bg-transparent bg-linear-to-r from-transparent via-current to-transparent',
				props.class,
			)}
		/>
	);
};
