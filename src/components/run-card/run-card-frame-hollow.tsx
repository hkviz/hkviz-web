import { Component, Match, Switch } from 'solid-js';
import { runCardInteractiveBrightnessClasses } from '~/components/run-card/run-card-interactive-brightness-classes.tsx';
import { cn } from '~/lib/utils.ts';
import {
	healthFrameImg,
	healthFrameSteelSoulBrokenImg,
	healthFrameSteelSoulImg,
	healthFrameSteelSoulSmallImg,
} from '~/lib/viz';

export const RunCardFrameHollow: Component<{ isSteelSoul: boolean; isBrokenSteelSoul: boolean }> = (props) => {
	return (
		<Switch
			fallback={
				<img
					src={healthFrameImg}
					alt="Standard game mode frame"
					class="absolute top-0 left-1 h-24 w-auto max-w-none"
				/>
			}
		>
			<Match when={props.isBrokenSteelSoul}>
				<img
					src={healthFrameSteelSoulBrokenImg}
					alt="Broken Steel Soul game mode frame"
					class={cn('absolute -top-8 -left-10 h-40 w-auto max-w-none', runCardInteractiveBrightnessClasses)}
				/>
			</Match>
			<Match when={props.isSteelSoul}>
				<img
					src={healthFrameSteelSoulImg}
					alt="Steel Soul game mode frame"
					class={cn(
						'roup-focus-visible:brightness-110 absolute -top-8 -left-10 hidden h-40 w-auto max-w-none sm:block',
						runCardInteractiveBrightnessClasses,
					)}
				/>
				<img
					src={healthFrameSteelSoulSmallImg}
					alt="Steel Soul game mode frame"
					class={cn(
						'absolute -top-8 -left-10 h-40 w-auto max-w-none sm:hidden',
						runCardInteractiveBrightnessClasses,
					)}
				/>
			</Match>
		</Switch>
	);
};
