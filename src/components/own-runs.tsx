import { useAction, useSearchParams, useSubmission } from '@solidjs/router';
import { type Component, Show, createMemo, createSignal } from 'solid-js';
import * as v from 'valibot';
import { errorGetMessage } from '~/lib/error-get-message';
import { GameId } from '~/lib/types/game-ids';
import { RunMetadata } from '~/server/run/_find_runs_internal';
import { findOwnRuns } from '~/server/run/find-own-runs';
import { runFilterBaseNoPageSchema } from '~/server/run/find_runs_base';
import { runCombine } from '~/server/run/run-combine';
import { BottomInteractionRow, BottomInteractionRowText } from './bottom_interaction';
import { RunFilters } from './run-filters';
import { RunList } from './run-list';
import { Button } from './ui/button';
import { showToast } from './ui/toast';

interface OwnRunsPageProps {}

export const OwnRuns: Component<OwnRunsPageProps> = () => {
	const [searchParams, _] = useSearchParams();
	const filter = createMemo(() => v.parse(runFilterBaseNoPageSchema, searchParams));
	const [selectedRunIds, setSelectedRunIds] = createSignal<string[]>([]);

	function cancelCombine() {
		setSelectedRunIds([]);
	}

	const combineAction = useAction(runCombine);
	const combineSubmission = useSubmission(runCombine);

	async function combine() {
		try {
			await combineAction({ runIds: selectedRunIds() });
			showToast({
				title: 'Gameplays successfully combined',
			});
			setSelectedRunIds([]);
		} catch (e) {
			showToast({
				title: 'Failed to combine gameplays',
				description: errorGetMessage(e),
			});
			console.log('failed to combine gameplays', e);
		}
	}

	const onCombineClicked = (run: RunMetadata) => {
		if (run.gameState.game !== combineModeGame()) {
			setCombineModeGame(run.gameState.game);
			setSelectedRunIds([run.id]);
		} else {
			setSelectedRunIds((selectedRunIds) => [...selectedRunIds, run.id]);
		}
	};

	const inCombineMode = () => selectedRunIds().length >= 1;
	const [combineModeGame, setCombineModeGame] = createSignal<GameId | null>(null);

	function disableSelection(run: RunMetadata) {
		if (combineSubmission.pending === true) {
			return true;
		}
		return combineModeGame() !== run.gameState.game;
	}

	return (
		<>
			<div class="mx-auto w-full max-w-200 pt-8">
				<h1 class="mb-4 pl-2 text-center font-serif text-3xl font-semibold">Your gameplays</h1>
				<RunFilters filter={filter()} class="mb-4" />
				<RunList
					filter={filter()}
					loadPage={findOwnRuns}
					showUser={false}
					selectionMode={inCombineMode()}
					selection={selectedRunIds()}
					selectionChanged={setSelectedRunIds}
					disableSelection={disableSelection}
					isOwnRun={() => true}
					onCombineClicked={onCombineClicked}
				/>
			</div>
			<BottomInteractionRow isVisible={inCombineMode()} mode="fixed">
				<BottomInteractionRowText>
					<Show when={selectedRunIds().length > 1} fallback={<>Select gameplays to combine into one</>}>
						{selectedRunIds().length} gameplays selected
					</Show>
				</BottomInteractionRowText>
				<Button onClick={cancelCombine} variant="ghost" disabled={combineSubmission.pending}>
					Cancel
				</Button>
				<Button
					onClick={combine}
					variant="default"
					disabled={selectedRunIds().length < 2 || combineSubmission.pending}
				>
					Combine
				</Button>
			</BottomInteractionRow>
		</>
	);
};
