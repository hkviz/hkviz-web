import { createMemo, Show } from 'solid-js';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { zeroPad } from '../util/zero-pad';
import { cn } from '../utils';
import { BEFORE_RECORDING_STEP_MS } from '../parser/recording-files/parser-shared/before-recording';

export function Duration(props: { ms: number; class?: string; withTooltip?: boolean }) {
	const data = createMemo(() => {
		const ms = props.ms;

		if (ms < 0) {
			const step = Math.ceil(-ms / BEFORE_RECORDING_STEP_MS);
			return {
				bold: '  T-',
				muted: String(zeroPad(step, 4)) + '  ',
			};
		}

		const hours = Math.floor(ms / 1000 / 60 / 60);
		const minutes = Math.floor((ms / 1000 / 60) % 60);
		const seconds = Math.floor((ms / 1000) % 60);
		const deciSeconds = Math.floor(Math.floor(ms % 1000) / 100);

		return {
			bold: zeroPad(hours, 2) + ':' + zeroPad(minutes, 2),
			muted: ':' + zeroPad(seconds, 2) + '.' + deciSeconds,
		};
	});

	const content = (
		<span class={cn('font-mono whitespace-pre', props.class)}>
			{data().bold}
			<span class="whitespace-pre opacity-40">{data().muted}</span>
		</span>
	);

	return (
		<Show when={props.withTooltip} fallback={content}>
			<Tooltip>
				<TooltipTrigger>{content}</TooltipTrigger>
				<TooltipContent>
					<Show when={props.ms < 0} fallback="Time since start of recording (hh:mm:ss.s)">
						Virtual step before recording. <br />
						Might not be 100% accurate.
					</Show>
				</TooltipContent>
			</Tooltip>
		</Show>
	);
}
