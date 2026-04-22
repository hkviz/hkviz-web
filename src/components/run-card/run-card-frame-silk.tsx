import { Component, Show } from 'solid-js';
import { runCardInteractiveBrightnessClasses } from '~/components/run-card/run-card-interactive-brightness-classes.tsx';
import { ToolCrestNameSilk, toolCrestNamesSilk } from '~/lib/game-data/silk-data/tool-crest-silk.generated';
import { brokenSpriteSilk, crestNameToHudSpriteSilk } from '~/lib/game-data/silk-data/tool-crests-silk';
import { cn } from '~/lib/utils.ts';

const defaultPositionClasses = 'top-2 left-0 h-15';
const positionClassesPerCrest: Partial<Record<ToolCrestNameSilk, string>> = {
	Hunter_v2: '-left-4',
};

export const RunCardFrameSilk: Component<{
	isSteelSoul: boolean;
	isBrokenSteelSoul: boolean;
	crestName: string | null | undefined;
}> = (props) => {
	const crestName: () => ToolCrestNameSilk = () =>
		toolCrestNamesSilk.includes(props.crestName as ToolCrestNameSilk)
			? (props.crestName as ToolCrestNameSilk)
			: 'Hunter';
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
					class={cn('absolute -top-2 -left-5 h-24 w-auto max-w-none', runCardInteractiveBrightnessClasses)}
				/>
			}
		>
			<img
				src={source()}
				alt={crestName() + ' crest in ' + (props.isSteelSoul ? 'Steel Soul' : 'standard') + ' mode'}
				class={cn('absolute w-auto max-w-none', positionClasses(), runCardInteractiveBrightnessClasses)}
			/>
		</Show>
	);
};
