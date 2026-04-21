import { type Component, Show } from 'solid-js';
import { cn } from '~/lib/utils';
import { type RunMetadata } from '~/server/run/_find_runs_internal';
import { type GetRunResult } from '~/server/run/run-get';
import { getMapZoneHudBackgroundWithStyleOverrides } from '../area-background';

export const RunCardBackground: Component<{
	run: RunMetadata | GetRunResult;
}> = (props) => {
	const gameState = () => props.run.gameState;
	const bgImage = () => getMapZoneHudBackgroundWithStyleOverrides(gameState());

	return (
		<div class="absolute inset-0 h-full w-full bg-black">
			<div class="relative h-full w-full opacity-70 group-hover:opacity-80 group-focus:opacity-80 group-active:opacity-60">
				<Show when={props.run.gameState.game === 'silk'}>
					<img
						class={cn(
							'top-[-10%] left-[-10%] h-[120%] w-[120%] object-cover object-[50%_70%] opacity-90 blur-lg',
							bgImage().imgClasses,
						)}
						src={bgImage().src}
						alt=""
						aria-hidden="true"
						loading="lazy"
					/>
				</Show>
				<div
					class={cn(
						'absolute',
						props.run.gameState.game === 'hollow'
							? 'top-0 left-0 h-full w-full'
							: 'top-0 left-[20%] h-full w-[60%]',
					)}
				>
					<img
						class={cn(
							'inset-0 h-full w-full object-cover object-center transition group-hover:brightness-110 group-focus:brightness-110 group-active:brightness-90',
							props.run.gameState.game === 'hollow' ? '' : 'area-background-fade-x object-[50%_70%]',
							bgImage().imgClasses,
						)}
						src={bgImage().src}
						alt=""
						aria-hidden="true"
						loading="lazy"
					/>
				</div>
			</div>
			<div class="absolute inset-0 bg-linear-to-r from-black via-transparent to-black" />
			<Show when={props.run.gameState.game === 'silk'}>
				<div class="absolute inset-0 shadow-[inset_0_0_2rem_0.5rem_black]" />
			</Show>
		</div>
	);
};
