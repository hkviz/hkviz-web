import { Show } from 'solid-js';
import {
	completionNameSilk,
	completionSpriteSilk,
	completionSubtitleSilk,
} from '~/lib/game-data/silk-data/player-data-silk';
import { SaveSlotCompletionIcons_CompletionStateSilk } from '~/lib/game-data/silk-data/player-data-silk.generated';
import { RunMetadata } from '~/server/run/_find_runs_internal';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

function RunCardCompletionIconSilk(props: { ending: SaveSlotCompletionIcons_CompletionStateSilk }) {
	return (
		<Tooltip>
			<TooltipTrigger
				class="z-10 flex h-6 w-6 items-center justify-center"
				as={Button}
				variant="ghost"
				size="icon"
			>
				<img src={completionSpriteSilk(props.ending)} class="max-h-5 max-w-5" />
			</TooltipTrigger>
			<TooltipContent class="flex flex-col">
				<span>{completionNameSilk(props.ending)}</span>
				<span class="text-sm text-muted-foreground">{completionSubtitleSilk(props.ending)}</span>
			</TooltipContent>
		</Tooltip>
	);
}

export function RunCardEndings(props: { run: RunMetadata }) {
	const gameStateAsSilk = () => {
		if (props.run.gameState.game === 'silk') {
			return props.run.gameState;
		}
		return null;
	};

	return (
		<Show when={gameStateAsSilk()}>
			{(gameState) => (
				<div class="z-10 flex flex-row">
					<Show when={gameState().endingAct2Regular}>
						<RunCardCompletionIconSilk ending="Act2Regular" />
					</Show>
					<Show when={gameState().endingAct2SoulSnare}>
						<RunCardCompletionIconSilk ending="Act2SoulSnare" />
					</Show>
					<Show when={gameState().endingAct2Cursed}>
						<RunCardCompletionIconSilk ending="Act2Cursed" />
					</Show>
					<Show when={gameState().endingAct3}>
						<RunCardCompletionIconSilk ending="Act3Ending" />
					</Show>
				</div>
			)}
		</Show>
	);
}
