import { type Component, For, Show, Suspense, createSignal, createUniqueId } from 'solid-js';
import { type findRunsInternal } from '~/server/run/_find_runs_internal';
import { RunCard } from './run-card';
import { BottomInteractionRow, BottomInteractionRowText } from './bottom_interaction';
import { GradientSeparator } from './ui/additions';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Key } from '@solid-primitives/keyed';

interface OwnRunsPageProps {
	runs: Awaited<ReturnType<typeof findRunsInternal>>;
}

export const OwnRuns: Component<OwnRunsPageProps> = (props) => {
	// TODO
	// const { toast } = useToast();
	// const router = useRouter();

	// const combineRunMutation = api.run.combine.useMutation({
	//     onSuccess: () => {
	//         toast({
	//             title: 'Gameplays successfully combined',
	//         });
	//         setSelectedRunIds([]);
	//         router.refresh();
	//     },
	//     onError: (error) => {
	//         console.log('failed to combine gameplays', error);
	//         toast({
	//             title: 'Failed to combine gameplays',
	//             description: error.message,
	//         });
	//     },
	// });

	const id = createUniqueId();
	const [selectedRunIds, setSelectedRunIds] = createSignal<string[]>([]);

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

	function combine() {
		// TODO
		// combineRunMutation.mutate({
		//     runIds: selectedRunIds,
		// });
	}

	const onCombineClicked = (runId: string) => {
		setSelectedRunIds((selectedRunIds) => [...selectedRunIds, runId]);
	};

	const inCombineMode = selectedRunIds.length >= 1;

	const onRunClick = (runId: string) => {
		setSelectedRunIds((selectedRunIds) => {
			if (selectedRunIds.includes(runId)) {
				return selectedRunIds.filter((id) => id !== runId);
			} else {
				return [...selectedRunIds, runId];
			}
		});
	};

	const onRunClickIfInCombineMode = inCombineMode ? onRunClick : undefined;

	return (
		<Show when={props.runs && props.runs.length > 0}>
			<GradientSeparator />
			<div class="w-full">
				<div class="mx-auto max-w-[800px]">
					<h1 class="mb-4 pl-2 text-center font-serif text-3xl font-semibold">Your gameplays</h1>
					<ul class="flex flex-col">
						<Key each={props.runs} by={(it) => it.id}>
							{(run) => {
								const checkboxId = `run-checkbox-${id}-${run().id}`;
								return (
									<li class="flex flex-row items-center gap-3">
										{inCombineMode && (
											<Checkbox
												id={checkboxId}
												checked={selectedRunIds().includes(run().id)}
												onChange={(checked) =>
													handleCheckedChanged(run().id, checked as boolean)
												}
											/>
										)}
										<div class="flex-grow">
											<RunCard
												run={run()}
												showUser={false}
												isOwnRun={true}
												onClick={onRunClickIfInCombineMode}
												onCombineClicked={onCombineClicked}
											/>
										</div>
									</li>
								);
							}}
						</Key>
					</ul>
				</div>
				<BottomInteractionRow isVisible={inCombineMode} mode="fixed">
					<BottomInteractionRowText>
						{selectedRunIds.length > 1
							? `${selectedRunIds.length} gameplays selected`
							: 'Select gameplays to combine into one'}
					</BottomInteractionRowText>
					<Button
						onClick={cancelCombine}
						variant="ghost"
						disabled={false /*TODO combineRunMutation.isLoading}>*/}
					>
						Cancel
					</Button>
					<Button
						onClick={combine}
						variant="default"
						disabled={selectedRunIds().length < 2 || false /*TODO combineRunMutation.isLoading}>*/}
					>
						Combine
					</Button>
				</BottomInteractionRow>
			</div>
		</Show>
	);
};
