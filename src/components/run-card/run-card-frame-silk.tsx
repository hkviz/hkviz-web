import { Component, Show } from 'solid-js';
import { runCardInteractiveBrightnessClasses } from '~/components/run-card/run-card-interactive-brightness-classes.tsx';
import { ToolCrestNameSilk, toolCrestNamesSilk } from '~/lib/game-data/silk-data/tool-crest-silk.generated';
import { brokenSpriteSilk, crestNameToHudSpriteSilk } from '~/lib/game-data/silk-data/tool-crests-silk';
import { cn } from '~/lib/utils.ts';

const targetCenterAtX = 11.5;
const targetCenterAtY = 9.5;

export const RunCardFrameSilk: Component<{
	isSteelSoul: boolean;
	isBrokenSteelSoul: boolean;
	crestName: string | null | undefined;
}> = (props) => {
	const crestName: () => ToolCrestNameSilk = () =>
		toolCrestNamesSilk.includes(props.crestName as ToolCrestNameSilk)
			? (props.crestName as ToolCrestNameSilk)
			: 'Hunter';
	const crestData = () => crestNameToHudSpriteSilk[crestName()];
	const source = () => {
		const data = crestData();
		return props.isSteelSoul ? data.seelSoulHud : data.normalHud;
	};

	const twSpacing = (nr: number) => `calc(var(--spacing) * ${Math.round(nr * 100) / 100})`;
	const pxToTw = (px: number) => `${twSpacing(px / 7)}`;

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
				class={cn('absolute w-auto max-w-none', runCardInteractiveBrightnessClasses)}
				style={{
					width: `${pxToTw(crestData().size.x)}`,
					height: `${pxToTw(crestData().size.y)}`,
					top: `calc(${twSpacing(targetCenterAtY)} - ${pxToTw(crestData().circleCenter.y)})`,
					left: `calc(${twSpacing(targetCenterAtX)} - ${pxToTw(crestData().circleCenter.x)})`,
				}}
			/>
		</Show>
	);
};
