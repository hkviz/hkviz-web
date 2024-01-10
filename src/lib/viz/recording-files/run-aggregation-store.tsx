import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import {
    HeroStateEvent,
    SceneEvent,
    SpellDownEvent,
    SpellFireballEvent,
    SpellUpEvent,
    isPlayerDataEventOfField,
    type ParsedRecording,
} from './recording';

import { Clock12, Clock2, Hash, type LucideIcon } from 'lucide-react';
import { formatTimeMs } from '~/lib/utils/time';
import coinImg from '../../../../public/ingame-sprites/HUD_coin_shop.png';
import spellUpImg from '../../../../public/ingame-sprites/Inv_0024_spell_scream_01.png';
import spellFireballImg from '../../../../public/ingame-sprites/Inv_0025_spell_fireball_01.png';
import spellDownImg from '../../../../public/ingame-sprites/Inv_0026_spell_quake_01.png';
import focusImg from '../../../../public/ingame-sprites/Inv_0029_spell_core.png';
import shadeImg from '../../../../public/ingame-sprites/bestiary_hollow-shade_s.png';
import healthImg from '../../../../public/ingame-sprites/select_game_HUD_0001_health.png';
import { playerDataFields } from '../player-data/player-data';

type RunId = string;
export type AggregatedRunData = ReturnType<typeof aggregateRecording>;

export const aggregationVariableInfos = {
    visits: {
        name: 'Visits',
        description: 'Number this scene has been entered',
        Icon: Hash,
    },
    firstVisitMs: {
        name: 'First visited at',
        description: 'Time of first visit (mm:ss)',
        Icon: Clock12,
        format: formatTimeMs,
    },
    timeSpendMs: {
        name: 'Time spent',
        description: 'Total time spent (mm:ss)',
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
        description: 'Number of times the player died in this room',
        image: shadeImg,
    },
    focusing: {
        name: 'Focusing',
        description: 'Number of times the player started to focus',
        image: focusImg,
    },
    spellFireball: {
        name: 'Vengeful Spirit',
        description: 'Number of times the player used a fireball spell',
        image: spellFireballImg,
    },
    spellDown: {
        name: 'Desolate Dive',
        description: 'Number of times the player used a down spell',
        image: spellDownImg,
    },
    spellUp: {
        name: 'Howling Wraiths',
        description: 'Number of times the player used an up spell',
        image: spellUpImg,
    },
    geoEarned: {
        name: 'Geo earned',
        description: 'Total geo earned',
        image: coinImg,
    },
    geoSpent: {
        name: 'Geo spent',
        description: 'Total geo spent',
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

function aggregateRecording(recording: ParsedRecording) {
    const countPerScene: Record<string, ValueAggregation> = {};
    const maxOverScenes: ValueAggregation = createEmptyAggregation();

    function addToScene(sceneEvent: SceneEvent | undefined, key: AggregationVariable, value: number) {
        if (!sceneEvent?.sceneName) return;
        const existing = countPerScene[sceneEvent.sceneName] ?? createEmptyAggregation();
        countPerScene[sceneEvent.sceneName] = {
            ...existing,
            [key]: existing[key] + value,
        };
        maxOverScenes[key] = Math.max(maxOverScenes[key], existing[key] + value);
    }

    let previousSceneEvent: SceneEvent | null = null;
    let previousSceneEnteredAtMs = 0;

    for (const event of recording.events) {
        if (event instanceof SceneEvent) {
            if (previousSceneEvent) {
                addToScene(previousSceneEvent, 'timeSpendMs', event.msIntoGame - previousSceneEnteredAtMs);
            }
            if (!countPerScene[event.sceneName]?.firstVisitMs) {
                addToScene(event, 'firstVisitMs', event.msIntoGame);
            }
            addToScene(event, 'visits', 1);
            previousSceneEvent = event;
            previousSceneEnteredAtMs = event.msIntoGame;
        } else if (event instanceof HeroStateEvent && event.field.name === 'dead' && event.value) {
            addToScene(event.previousPlayerPositionEvent?.sceneEvent, 'deaths', 1);
        } else if (event instanceof HeroStateEvent && event.field.name === 'focusing') {
            addToScene(event.previousPlayerPositionEvent?.sceneEvent, 'focusing', 1);
        } else if (event instanceof SpellFireballEvent) {
            addToScene(event.previousPlayerPositionEvent?.sceneEvent, 'spellFireball', 1);
        } else if (event instanceof SpellUpEvent) {
            addToScene(event.previousPlayerPositionEvent?.sceneEvent, 'spellUp', 1);
        } else if (event instanceof SpellDownEvent) {
            addToScene(event.previousPlayerPositionEvent?.sceneEvent, 'spellDown', 1);
        } else if (
            isPlayerDataEventOfField(event, playerDataFields.byFieldName.health) &&
            event.previousPlayerDataEventOfField
        ) {
            const diff = event.value - event.previousPlayerDataEventOfField.value;
            if (diff < 0) {
                addToScene(event.previousPlayerPositionEvent?.sceneEvent, 'damageTaken', -diff);
            }
        } else if (
            isPlayerDataEventOfField(event, playerDataFields.byFieldName.healthBlue) &&
            event.previousPlayerDataEventOfField
        ) {
            const diff = event.value - event.previousPlayerDataEventOfField.value;
            if (diff < 0) {
                addToScene(event.previousPlayerPositionEvent?.sceneEvent, 'damageTaken', -diff);
            }
        } else if (
            isPlayerDataEventOfField(event, playerDataFields.byFieldName.geo) &&
            event.previousPlayerDataEventOfField
        ) {
            // todo handle death changes in currency
            const diff = event.value - event.previousPlayerDataEventOfField.value;
            if (diff < 0) {
                addToScene(event.previousPlayerPositionEvent?.sceneEvent, 'geoSpent', -diff);
            } else if (diff > 0) {
                addToScene(event.previousPlayerPositionEvent?.sceneEvent, 'geoEarned', diff);
            }
        }
    }

    if (previousSceneEvent) {
        addToScene(previousSceneEvent, 'timeSpendMs', recording.lastEvent().msIntoGame - previousSceneEnteredAtMs);
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
