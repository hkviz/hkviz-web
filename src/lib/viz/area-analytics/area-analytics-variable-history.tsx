import { Component, createMemo, Show } from 'solid-js';
import { AggregationTimePointBase } from '~/lib/aggregation/aggregation-value-base';
import { AggregationVariable } from '~/lib/aggregation/aggregation-variable';
import { assertNever } from '~/lib/parser';
import { Duration } from '../duration';
import { useAggregationStore } from '../store/aggregation-store';
import { useGameplayStore } from '../store/gameplay-store';
import { AreaSelectionMode, useRoomDisplayStore } from '../store/room-display-store';
import { TimelineList, TimelineListEntryButton } from '../timeline-list/timeline-list';
import { useAreaAnalyticsContext } from './area-analytics-context';

function noHistoryMessage(mode: AreaSelectionMode): string {
	if (mode === 'room') return 'No changes to this variable in the selected room.';
	if (mode === 'zone') return 'No changes to this variable in the selected zone.';
	if (mode === 'all') return 'No changes to this variable in the entire run.';
	return assertNever(mode);
}

const AreaAnalyticsVariableHistoryRow: Component<{
	variable: AggregationVariable;
	previousEntry: AggregationTimePointBase | null;
	entry: AggregationTimePointBase;
}> = (props) => {
	const gameplayStore = useGameplayStore();
	const aggregation = () => gameplayStore.gameModule()!.aggregation;
	const varInfo = createMemo(() => aggregation().variableInfos[props.variable]);

	const delta = createMemo(() => {
		const previousValue =
			props.previousEntry?.getValue(props.variable) ?? aggregation().DEFAULT_VALUES.getValue(props.variable);
		const deltaValue = (props.entry.getValue(props.variable) ?? 0) - (previousValue ?? 0);
		return deltaValue;
	});

	return (
		<TimelineListEntryButton
			class="flex items-center justify-between p-2 pr-4 pl-3 text-sm"
			heightMode="from-estimate"
			areaColor="left"
		>
			<Duration ms={props.entry.msIntoGame} class="pr-3" withTooltip={false} />
			<span>
				<Show when={varInfo().showHistoryDelta && delta()}>
					{(delta) => (
						<>
							<Show when={delta() >= 0} fallback={<span class="mr-1">-</span>}>
								<span class="mr-1">+</span>
							</Show>
							<span>{varInfo().format(delta() ?? 0)}</span>
						</>
					)}
				</Show>
			</span>
			<span>{varInfo().format(props.entry.getValue(props.variable))}</span>
		</TimelineListEntryButton>
	);
};

export const AreaAnalyticsVariableHistory: Component = () => {
	const gameplayStore = useGameplayStore();
	const roomDisplayStore = useRoomDisplayStore();
	const roomInfosContext = useAreaAnalyticsContext();
	const aggregationStore = useAggregationStore();

	const history = createMemo(() => {
		const virtualScene = aggregationStore.selectedVirtualScene();
		const variable = roomInfosContext.selectedVariable();
		if (!variable) return [];
		if (!virtualScene) return [];
		return aggregationStore.getAggregationHistory(virtualScene, variable);
	});

	function getSceneName(entry: AggregationTimePointBase) {
		const newScene = gameplayStore.recording()?.sceneEventFromMs(entry.msIntoGame)?.sceneName;
		return newScene;
	}

	return (
		<div class="flex shrink grow basis-0 flex-col">
			<Show when={roomInfosContext.selectedVariable()}>
				{(variable) => (
					<Show
						when={history().length > 0}
						fallback={
							<p class="p-2 text-sm italic">{noHistoryMessage(roomDisplayStore.areaSelectionMode())}</p>
						}
					>
						<TimelineList
							entries={history()}
							getEntryTime={(entry) => entry.msIntoGame}
							getSceneName={getSceneName}
							estimateSize={() => 37}
							virtualize={true}
						>
							{(entry, _state, previousEntry) => (
								<AreaAnalyticsVariableHistoryRow
									variable={variable()}
									entry={entry()}
									previousEntry={previousEntry() ?? null}
								/>
							)}
						</TimelineList>
					</Show>
				)}
			</Show>
		</div>
	);
};
