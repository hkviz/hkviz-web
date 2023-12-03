import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { HeroStateEvent, type SceneEvent, type ParsedRecording } from './recording';

type RunId = string;
export type AggregatedRunData = ReturnType<typeof aggregateRecording>;

export type ValueAggregation = {
    deaths: number;
    focusing: number;
};

export type AggregationVariable = keyof ValueAggregation;

type AggregationStoreValue = Record<RunId, AggregatedRunData>;

function aggregateRecording(recording: ParsedRecording) {
    const countPerScene: Record<string, ValueAggregation> = {};
    const maxOverScenes: ValueAggregation = { deaths: 0, focusing: 0 };

    function addToScene(sceneEvent: SceneEvent | undefined, key: AggregationVariable, value: number) {
        if (!sceneEvent?.sceneName) return;
        const existing = countPerScene[sceneEvent.sceneName] ?? { deaths: 0, focusing: 0 };
        countPerScene[sceneEvent.sceneName] = {
            ...existing,
            [key]: existing[key] + value,
        };
        maxOverScenes[key] = Math.max(maxOverScenes[key], existing[key] + value);
    }

    for (const event of recording.events) {
        if (event instanceof HeroStateEvent && event.field.name === 'dead') {
            addToScene(event.previousPlayerPositionEvent?.sceneEvent, 'deaths', 1);
        } else if (event instanceof HeroStateEvent && event.field.name === 'focusing') {
            addToScene(event.previousPlayerPositionEvent?.sceneEvent, 'focusing', 1);
        }
    }
    return { countPerScene, maxOverScenes };
}

export const useRunAggregationStore = create(
    combine({ aggregations: {} as AggregationStoreValue }, (set, get) => {
        function updateFromCombinedRecording(recording: ParsedRecording, runId: RunId) {
            set((state) => ({
                aggregations: {
                    ...state.aggregations,
                    [runId]: aggregateRecording(recording),
                },
            }));
        }
        return { updateFromCombinedRecording };
    }),
);
