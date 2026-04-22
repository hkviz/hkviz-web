import { Key } from '@solid-primitives/keyed';
import { createAsync, useAction, useSearchParams, useSubmission } from '@solidjs/router';
import { type Component, Show, createMemo, createSignal, createUniqueId } from 'solid-js';
import * as v from 'valibot';
import { errorGetMessage } from '~/lib/error-get-message';
import { findOwnRuns } from '~/server/run/find-own-runs';
import { RunFilterParamsSchema } from '~/server/run/find-public-runs';
import { runCombine } from '~/server/run/run-combine';
import { BottomInteractionRow, BottomInteractionRowText } from './bottom_interaction';
import { RunCard } from './run-card/run-card';
import { RunFilters } from './run-filters';
import { GradientSeparator } from './ui/additions';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { showToast } from './ui/toast';

interface OwnRunsPageProps {}

export const OwnRuns: Component<OwnRunsPageProps> = (props) => {
	const id = createUniqueId();
	const [searchParams, _] = useSearchParams();
	const filter = createMemo(() => v.parse(RunFilterParamsSchema, searchParams));
	const [selectedRunIds, setSelectedRunIds] = createSignal<string[]>([]);

	const runs = createAsync(() => findOwnRuns(filter()));

	function handleCheckedChanged(runId: string, checked: boolean) {
		if (checked) {
			setSelectedRunIds([...selectedRunIds(), runId]);
		} else {
			setSelectedRunIds(selectedRunIds().filter((id) => id !== runId));
		}
	}

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

	const onCombineClicked = (runId: string) => {
		setSelectedRunIds((selectedRunIds) => [...selectedRunIds, runId]);
	};

	const inCombineMode = () => selectedRunIds().length >= 1;

	const onRunClick = (runId: string) => {
		setSelectedRunIds((selectedRunIds) => {
			if (selectedRunIds.includes(runId)) {
				return selectedRunIds.filter((id) => id !== runId);
			} else {
				return [...selectedRunIds, runId];
			}
		});
	};

	const onRunClickIfInCombineMode = () => (inCombineMode() ? onRunClick : undefined);

	return (
		<>
			<GradientSeparator />
			<Show when={runs()}>
				{(runs) => (
					<div class="w-full">
						<div class="mx-auto max-w-200">
							<h1 class="mb-4 pl-2 text-center font-serif text-3xl font-semibold">Your gameplays</h1>
							<RunFilters searchParams={searchParams} class="mb-4" />
							<ul class="flex flex-col">
								<Show when={runs().length > 0} fallback={<p class="text-center">No gameplays found</p>}>
									<Key each={runs()} by={(it) => it.id}>
										{(run) => {
											const checkboxId = `run-checkbox-${id}-${run().id}`;
											return (
												<li class="flex flex-row items-center gap-3">
													<Show when={inCombineMode()}>
														<Checkbox
															id={checkboxId}
															checked={selectedRunIds().includes(run().id)}
															disabled={combineSubmission.pending}
															onChange={(checked) =>
																handleCheckedChanged(run().id, checked as boolean)
															}
														/>
													</Show>
													<div class="grow">
														<RunCard
															run={run()}
															showUser={false}
															isOwnRun={true}
															onClick={onRunClickIfInCombineMode()}
															onCombineClicked={onCombineClicked}
														/>
													</div>
												</li>
											);
										}}
									</Key>
								</Show>
							</ul>
						</div>
						<BottomInteractionRow isVisible={inCombineMode()} mode="fixed">
							<BottomInteractionRowText>
								<Show
									when={selectedRunIds().length > 1}
									fallback={<>Select gameplays to combine into one</>}
								>
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
					</div>
				)}
			</Show>
		</>
	);
};
