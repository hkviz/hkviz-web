import { Component, Show } from 'solid-js';
import { runCardInteractiveBrightnessClasses } from '~/components/run-card/run-card-interactive-brightness-classes.tsx';
import { CrestNameSilk, crestNamesSilk } from '~/lib/game-data/silk-data/crests-silk.generated';
import { brokenSpriteSilk, crestNameToHudSpriteSilk } from '~/lib/game-data/silk-data/crests-silk.ts';
import { cn } from '~/lib/utils.ts';

const defaultPositionClasses = 'top-2 left-0 h-15';
const positionClassesPerCrest: Partial<Record<CrestNameSilk, string>> = {
	Hunter_v2: '-left-4',
};

export const RunCardFrameSilk: Component<{
	isSteelSoul: boolean;
	isBrokenSteelSoul: boolean;
	crestName: string;
}> = (props) => {
	const crestName: () => CrestNameSilk = () =>
		crestNamesSilk.includes(props.crestName as CrestNameSilk) ? (props.crestName as CrestNameSilk) : 'Hunter';
	const source = () => {
		const byMode = crestNameToHudSpriteSilk[crestName()];
		return props.isSteelSoul ? byMode.seelSoulHud : byMode.normalHud;
	};
	const positionClasses = () => cn(defaultPositionClasses, positionClassesPerCrest[crestName()]);

	return (
		<Show
			when={!props.isBrokenSteelSoul}
			fallback={
				<img
					src={brokenSpriteSilk}
					alt="Broken Steel Soul game mode frame"
					class={cn(
						'absolute -top-2 -left-5 z-2 h-24 w-auto max-w-none',
						runCardInteractiveBrightnessClasses,
					)}
				/>
			}
		>
			<img
				src={source()}
				alt={crestName() + ' crest in ' + (props.isSteelSoul ? 'Steel Soul' : 'standard') + ' mode'}
				class={cn('absolute z-2 w-auto max-w-none', positionClasses(), runCardInteractiveBrightnessClasses)}
			/>
		</Show>
	);
};
