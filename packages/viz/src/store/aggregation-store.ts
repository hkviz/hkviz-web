import {
    FrameEndEvent,
    HeroStateEvent,
    SceneEvent,
    SpellDownEvent,
    SpellFireballEvent,
    SpellUpEvent,
    isPlayerDataEventOfField,
    playerDataFields,
    roomGroupNamesBySceneName,
    type CombinedRecording,
    type PlayerDataEvent,
} from '@hkviz/parser';
import { formatTimeMs } from '../util';
import { gameplayStore } from './gameplay-store';
import { createMemo, createSignal } from 'solid-js';

export type ValueAggregation = {
    deaths: number;
    focusing: number;
    spellFireball: number;
    spellUp: number;
    spellDown: number;
    damageTaken: number;
    geoEarned: number;
    geoSpent: number;
    timeSpendMs: number;
    firstVisitMs: number;
    visits: number;
};

const createEmptyAggregation = (): ValueAggregation => ({
    deaths: 0,
    focusing: 0,
    spellFireball: 0,
    spellUp: 0,
    spellDown: 0,
    damageTaken: 0,
    geoEarned: 0,
    geoSpent: 0,
    timeSpendMs: 0,
    firstVisitMs: 0,
    visits: 0,
});

export type AggregationVariable = keyof ValueAggregation;

export type AggregatedRunData = ReturnType<typeof aggregateRecording>;

export const aggregationVariableInfos: {
    [key in AggregationVariable]: {
        name: string;
        description: string;
        format?: (value: number) => string;
    };
} = {
    visits: {
        name: 'Visits',
        description: 'Number of times this scene has been entered.',
    },
    firstVisitMs: {
        name: 'First visited at',
        description: 'Time of first visit',
        format: formatTimeMs,
    },
    timeSpendMs: {
        name: 'Time spent',
        description: 'Total time spent in a scene of all visits combined.',
        format: formatTimeMs,
    },
    damageTaken: {
        name: 'Damage taken',
        description: 'Total damage taken in masks',
    },
    deaths: {
        name: 'Deaths',
        description: 'Number of times the player died in a scene.',
    },
    focusing: {
        name: 'Focusing',
        description: 'Number of times the player started to focus.',
    },
    spellFireball: {
        name: 'Vengeful Spirit',
        description: 'Number of times the player used a fireball spell.',
    },
    spellDown: {
        name: 'Desolate Dive',
        description: 'Number of times the player used a downwards spell.',
    },
    spellUp: {
        name: 'Howling Wraiths',
        description: 'Number of times the player used an upwards spell.',
    },
    geoEarned: {
        name: 'Geo earned',
        description: 'Does not include geo earned by defeating the shade.',
    },
    geoSpent: {
        name: 'Geo spent',
        description: 'Does not include Geo lost by dying and not defeating the shade.',
    },
};

export const aggregationVariables = Object.keys(aggregationVariableInfos) as AggregationVariable[];

export function formatAggregatedVariableValue(variable: AggregationVariable, value: number) {
    const varInfo = aggregationVariableInfos[variable];
    return 'format' in varInfo && varInfo.format ? varInfo.format(value) : value;
}

// type AggregationStoreValue = Record<RunId, AggregatedRunData>;

export function aggregateRecording(recording: CombinedRecording) {
    const countPerScene: Record<string, ValueAggregation> = {};
    const maxOverScenes: ValueAggregation = createEmptyAggregation();

    function addToScenes(virtualScenes: readonly string[], key: AggregationVariable, value: number) {
        virtualScenes.forEach((sceneOrGroupName) => {
            const existing = countPerScene[sceneOrGroupName] ?? createEmptyAggregation();
            countPerScene[sceneOrGroupName] = {
                ...existing,
                [key]: existing[key] + value,
            };
            maxOverScenes[key] = Math.max(maxOverScenes[key], existing[key] + value);
        });
    }

    let currentSceneEvent: SceneEvent | null = null;
    let currentVirtualScenes: string[] = [];
    let previousSceneEnteredAtMs = 0;

    const x = [] as any[];

    function currentVirtualScenesChanged({
        event,
        previousSceneEvent,
    }: {
        event: SceneEvent | PlayerDataEvent<typeof playerDataFields.byFieldName.currentBossSequence>;
        previousSceneEvent: SceneEvent | null;
    }) {
        const groups = currentSceneEvent ? roomGroupNamesBySceneName.get(currentSceneEvent.sceneName) ?? [] : [];
        const previousVirtualScenes = currentVirtualScenes;
        currentVirtualScenes = [
            ...(currentSceneEvent ? [currentSceneEvent.sceneName] : []),
            ...groups.map((it) => it),
        ].flatMap((it) => {
            if (currentSceneEvent?.currentBossSequence) {
                return [
                    it,
                    `group_boss_seq:${currentSceneEvent.currentBossSequence.name}`,
                    `boss_seq:${currentSceneEvent.currentBossSequence.name}:${it}`,
                ];
            } else {
                return [it];
            }
        });
        x.push(formatTimeMs(event.msIntoGame) + ' ' + currentVirtualScenes.join(','));
        if (previousSceneEvent) {
            addToScenes(previousVirtualScenes, 'timeSpendMs', event.msIntoGame - previousSceneEnteredAtMs);
        }
        previousSceneEnteredAtMs = event.msIntoGame;

        for (const virtualScene of currentVirtualScenes) {
            const virtualSceneAsArr = [virtualScene];
            if (!countPerScene[virtualScene]?.firstVisitMs) {
                addToScenes(virtualSceneAsArr, 'firstVisitMs', event.msIntoGame);
            }
            if (!previousVirtualScenes.includes(virtualScene)) {
                // only counts visit when not already in virtual scene before
                addToScenes(virtualSceneAsArr, 'visits', 1);
            }
        }
    }

    for (const event of recording.events) {
        if (event instanceof SceneEvent) {
            const previousSceneEvent = currentSceneEvent;
            currentSceneEvent = event;
            currentVirtualScenesChanged({
                event,
                previousSceneEvent,
            });
        } else if (event instanceof HeroStateEvent && event.field.name === 'dead' && event.value) {
            // counted in frame end event, since deaths in pantheons (and probably dreams) don't trigger heroState dead
            // addToScenes(currentVirtualScenes, 'deaths', 1);
        } else if (event instanceof HeroStateEvent && event.field.name === 'focusing') {
            addToScenes(currentVirtualScenes, 'focusing', 1);
        } else if (event instanceof SpellFireballEvent) {
            addToScenes(currentVirtualScenes, 'spellFireball', 1);
        } else if (event instanceof SpellUpEvent) {
            addToScenes(currentVirtualScenes, 'spellUp', 1);
        } else if (event instanceof SpellDownEvent) {
            addToScenes(currentVirtualScenes, 'spellDown', 1);
        } else if (
            isPlayerDataEventOfField(event, playerDataFields.byFieldName.health) &&
            event.previousPlayerDataEventOfField
        ) {
            const diff = event.value - event.previousPlayerDataEventOfField.value;
            if (diff < 0) {
                addToScenes(currentVirtualScenes, 'damageTaken', -diff);
            }
        } else if (
            isPlayerDataEventOfField(event, playerDataFields.byFieldName.healthBlue) &&
            event.previousPlayerDataEventOfField
        ) {
            const diff = event.value - event.previousPlayerDataEventOfField.value;
            if (diff < 0) {
                addToScenes(currentVirtualScenes, 'damageTaken', -diff);
            }
        } else if (event instanceof FrameEndEvent && event.previousFrameEndEvent) {
            if (
                event.healthTotal === 0 &&
                event.previousFrameEndEvent &&
                event.previousFrameEndEvent.healthTotal !== 0
            ) {
                addToScenes(currentVirtualScenes, 'deaths', 1);
            }
            // todo handle death changes in currency
            const poolDiff = event.geoPool - event.previousFrameEndEvent.geoPool;
            let geoDiff = event.geo - event.previousFrameEndEvent.geo;
            const dead = event.dead;

            if (poolDiff != 0) {
                // console.log({
                //     poolDiff,
                //     geoDiff,
                //     dead,
                //     formatTimeMs: formatTimeMs(event.msIntoGame),
                //     currentVirtualScenes: currentVirtualScenes.join(','),
                // });
                if (dead) {
                    geoDiff += event.geoPool;
                } else {
                    geoDiff += poolDiff;
                }
            }

            // if (event.geoPool && event.geoPool != event.previousFrameEndEvent.geoPool) {
            //     // died again
            //     diff += event.previousFrameEndEvent.geoPool;
            // }

            if (geoDiff < 0) {
                addToScenes(currentVirtualScenes, 'geoSpent', -geoDiff);
            } else if (geoDiff > 0) {
                addToScenes(currentVirtualScenes, 'geoEarned', geoDiff);
            }
        }
    }

    if (currentSceneEvent) {
        addToScenes(currentVirtualScenes, 'timeSpendMs', recording.lastEvent().msIntoGame - previousSceneEnteredAtMs);
    }

    // console.log({ countPerScene, maxOverScenes });
    // console.log(x);

    return { countPerScene, maxOverScenes };
}

const aggregations = createMemo(() => {
    const recording = gameplayStore.recording();
    if (!recording) return null;
    return aggregateRecording(recording);
});

const [viewNeverHappenedAggregations, setViewNeverHappenedAggregations] = createSignal(false);

export const aggregationStore = {
    data: aggregations,
    viewNeverHappenedAggregations,
    setViewNeverHappenedAggregations,
};
