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
			<div
				class={cn(
					'relative h-full w-full',
					props.run.gameState.game === 'hollow'
						? 'opacity-70 group-focus-within:opacity-80 group-hover:opacity-80 group-active:opacity-80 group-data-focus-context:opacity-80'
						: 'opacity-80 group-focus-within:opacity-100 group-hover:opacity-100 group-active:opacity-100 group-data-focus-context:opacity-100',
				)}
			>
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
							'inset-0 h-full w-full object-cover object-center transition group-focus-within:brightness-110 group-hover:brightness-110 group-active:brightness-90 group-data-focus-context:brightness-110',
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
