import { Component, createMemo, Show } from 'solid-js';
import { assertNever } from '~/lib/parser';
import { AreaSelectionMode, useAggregationStore, useGameplayStore, useRoomDisplayStore } from '../store';
import {
	AggregationVariable,
	aggregationVariableDefaultValue,
	aggregationVariableInfos,
	ValueAggregationTimePoint,
} from '../store/aggregations/aggregate-recording';
import { TimelineList, TimelineListEntryButton } from '../timeline-list/timeline-list';
import { formatTimeMs } from '../util/time';
import { useAreaAnalyticsContext } from './area-analytics-context';

function noHistoryMessage(mode: AreaSelectionMode): string {
	if (mode === 'room') return 'No changes to this variable in the selected room.';
	if (mode === 'zone') return 'No changes to this variable in the selected zone.';
	if (mode === 'all') return 'No changes to this variable in the entire run.';
	assertNever(mode);
}

const AreaAnalyticsVariableHistoryRow: Component<{
	variable: AggregationVariable;
	previousEntry: ValueAggregationTimePoint | null;
	entry: ValueAggregationTimePoint;
}> = (props) => {
	const varInfo = createMemo(() => aggregationVariableInfos[props.variable]);

	const delta = createMemo(() => {
		const previousValue = props.previousEntry?.[props.variable] ?? aggregationVariableDefaultValue(props.variable);
		const deltaValue = (props.entry[props.variable] ?? 0) - (previousValue ?? 0);
		return deltaValue;
	});

	return (
		<TimelineListEntryButton class="flex items-center justify-between p-2 pr-4 text-sm">
			<span>{formatTimeMs(props.entry.msIntoGame)}</span>
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
			<span>{varInfo().format(props.entry[props.variable])}</span>
		</TimelineListEntryButton>
	);
};

export const AreaAnalyticsVariableHistory: Component = () => {
	const gameplayStore = useGameplayStore();
	const roomDisplayStore = useRoomDisplayStore();
	const roomInfosContext = useAreaAnalyticsContext();
	const roomInfosStore = useAggregationStore();
	const aggregationStore = useAggregationStore();

	const history = createMemo(() => {
		const virtualScene = aggregationStore.selectedVirtualScene();
		const variable = roomInfosContext.selectedVariable();
		if (!variable) return [];
		if (!virtualScene) return [];
		return roomInfosStore.getAggregationHistory(virtualScene, variable);
	});

	function getSceneName(entry: ValueAggregationTimePoint) {
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
						>
							{(entry, _state, previousEntry) => (
								<AreaAnalyticsVariableHistoryRow
									variable={variable()}
									entry={entry}
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
