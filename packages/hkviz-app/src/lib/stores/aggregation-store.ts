import { computed, signal } from '@preact/signals-react';
import { Clock12, Clock2, Hash, type LucideIcon } from 'lucide-react';
import { formatTimeMs } from '~/lib/utils/time';
import coinImg from '../../../public/ingame-sprites/HUD_coin_shop.png';
import shadeImg from '../../../public/ingame-sprites/bestiary/bestiary_hollow-shade_s.png';
import spellUpImg from '../../../public/ingame-sprites/inventory/Inv_0024_spell_scream_01.png';
import spellFireballImg from '../../../public/ingame-sprites/inventory/Inv_0025_spell_fireball_01.png';
import spellDownImg from '../../../public/ingame-sprites/inventory/Inv_0026_spell_quake_01.png';
import focusImg from '../../../public/ingame-sprites/inventory/Inv_0029_spell_core.png';
import healthImg from '../../../public/ingame-sprites/select_game_HUD_0001_health.png';
import { roomGroupNamesBySceneName } from '../viz/map-data/room-groups';
import { playerDataFields } from '../viz/player-data/player-data';
import { FrameEndEvent } from '../viz/recording-files/events/frame-end-event';
import { type PlayerDataEvent } from '../viz/recording-files/events/player-data-event';
import { SceneEvent } from '../viz/recording-files/events/scene-event';
import {
    HeroStateEvent,
    SpellDownEvent,
    SpellFireballEvent,
    SpellUpEvent,
    isPlayerDataEventOfField,
    type CombinedRecording,
} from '../viz/recording-files/recording';
import { gameplayStore } from './gameplay-store';

type RunId = string;
export type AggregatedRunData = ReturnType<typeof aggregateRecording>;

export const aggregationVariableInfos = {
    visits: {
        name: 'Visits',
        description: 'Number of times this scene has been entered.',
        Icon: Hash,
    },
    firstVisitMs: {
        name: 'First visited at',
        description: 'Time of first visit',
        Icon: Clock12,
        format: formatTimeMs,
    },
    timeSpendMs: {
        name: 'Time spent',
        description: 'Total time spent in a scene of all visits combined.',
        Icon: Clock2,
        format: formatTimeMs,
    },
    damageTaken: {
        name: 'Damage taken',
        description: 'Total damage taken in masks',
        image: healthImg,
    },
    deaths: {
        name: 'Deaths',
        description: 'Number of times the player died in a scene.',
        image: shadeImg,
    },
    focusing: {
        name: 'Focusing',
        description: 'Number of times the player started to focus.',
        image: focusImg,
    },
    spellFireball: {
        name: 'Vengeful Spirit',
        description: 'Number of times the player used a fireball spell.',
        image: spellFireballImg,
    },
    spellDown: {
        name: 'Desolate Dive',
        description: 'Number of times the player used a downwards spell.',
        image: spellDownImg,
    },
    spellUp: {
        name: 'Howling Wraiths',
        description: 'Number of times the player used an upwards spell.',
        image: spellUpImg,
    },
    geoEarned: {
        name: 'Geo earned',
        description: 'Does not include geo earned by defeating the shade.',
        image: coinImg,
    },
    geoSpent: {
        name: 'Geo spent',
        description: 'Does not include Geo lost by dying and not defeating the shade.',
        image: coinImg,
    },
} satisfies Record<
    AggregationVariable,
    { name: string; description: string; format?: (value: number) => string } & (
        | { Icon: LucideIcon }
        | { image: typeof coinImg }
    )
>;

export const aggregationVariables = Object.keys(aggregationVariableInfos) as AggregationVariable[];

export function formatAggregatedVariableValue(variable: AggregationVariable, value: number) {
    const varInfo = aggregationVariableInfos[variable];
    return 'format' in varInfo ? varInfo.format(value) : value;
}

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

type AggregationStoreValue = Record<RunId, AggregatedRunData>;

function aggregateRecording(recording: CombinedRecording) {
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

const aggregations = computed(() => {
    const recording = gameplayStore.recording.value;
    if (!recording) return null;
    return aggregateRecording(recording);
});

const viewNeverHappenedAggregations = signal(false);

export const aggregationStore = {
    data: aggregations,
    viewNeverHappenedAggregations,
};
