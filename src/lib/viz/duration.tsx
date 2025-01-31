import { Show } from 'solid-js';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { zeroPad } from '../parser';
import { cn } from '../utils';

export function Duration(props: { ms: number; class?: string; withTooltip?: boolean }) {
	const hours = () => Math.floor(props.ms / 1000 / 60 / 60);
	const minutes = () => Math.floor((props.ms / 1000 / 60) % 60);
	const seconds = () => Math.floor((props.ms / 1000) % 60);
	const deciSeconds = () => Math.floor(Math.floor(props.ms % 1000) / 100);

	const content = (
		<span class={cn('font-mono', props.class)}>
			{zeroPad(hours(), 2)}:{zeroPad(minutes(), 2)}
			<span class="opacity-40">
				:{zeroPad(seconds(), 2)}.{deciSeconds()}
			</span>
		</span>
	);

	return (
		<Show when={props.withTooltip} fallback={content}>
			<Tooltip>
				<TooltipTrigger>{content}</TooltipTrigger>
				<TooltipContent>hh:mm:ss.s</TooltipContent>
			</Tooltip>
		</Show>
	);
}
