import { createMemo, Show } from 'solid-js';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import type { RestorePointInfo } from '../parser/recording-files/events-shared/event-creation-context';
import { BEFORE_RECORDING_STEP_MS } from '../parser/recording-files/parser-shared/before-recording';
import { zeroPad } from '../util/zero-pad';
import { cn } from '../utils';

export function Duration(props: {
	ms: number;
	class?: string;
	withTooltip?: boolean;
	// only set for Silk events actually reconstructed from a restore point - undefined/null means
	// it's a guessed virtual step (e.g. Hollow's before-recording scenes) instead
	restorePoint?: RestorePointInfo | null;
}) {
	const data = createMemo(() => {
		const ms = props.ms;

		if (ms < 0) {
			const step = Math.ceil(-ms / BEFORE_RECORDING_STEP_MS);
			const restorePoint = props.restorePoint;
			// the 2 extra trailing spaces (vs. the plain '  ' below) replace the width the "()" used to
			// take up, so alignment stays the same now that the parens are gone
			const spaceIfNoRestore = restorePoint ? '' : ' ';
			return {
				bold: spaceIfNoRestore + spaceIfNoRestore + 'T-' + zeroPad(step, 4),
				muted: restorePoint ? ` R${zeroPad(restorePoint.number, 2)}` : '  ',
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
						<Show when={props.restorePoint}>
							{(restorePoint) => (
								<p class="text-sm text-muted-foreground">
									Event reconstructed from restore point {restorePoint().number} (
									{restorePoint().date}).
								</p>
							)}
						</Show>
					</Show>
				</TooltipContent>
			</Tooltip>
		</Show>
	);
}
