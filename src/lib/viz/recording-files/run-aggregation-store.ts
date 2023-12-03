import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import {
    HeroStateEvent,
    type SceneEvent,
    type ParsedRecording,
    SpellFireballEvent,
    SpellUpEvent,
    SpellDownEvent,
    PlayerDataEvent,
    isPlayerDataEventOfField,
} from './recording';

import shadeImg from '../../../../public/ingame-sprites/bestiary_hollow-shade_s.png';
import focusImg from '../../../../public/ingame-sprites/Inv_0029_spell_core.png';
import spellUpImg from '../../../../public/ingame-sprites/Inv_0024_spell_scream_01.png';
import spellDownImg from '../../../../public/ingame-sprites/Inv_0026_spell_quake_01.png';
import spellFireballImg from '../../../../public/ingame-sprites/Inv_0025_spell_fireball_01.png';
import healthImg from '../../../../public/ingame-sprites/select_game_HUD_0001_health.png';
import { playerDataFields } from '../player-data/player-data';

type RunId = string;
export type AggregatedRunData = ReturnType<typeof aggregateRecording>;

export const aggregationVariableInfos = {
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
    spellUp: {
        name: 'Howling Wraiths',
        description: 'Number of times the player used an up spell',
        image: spellUpImg,
    },
    spellDown: {
        name: 'Desolate Dive',
        description: 'Number of times the player used a down spell',
        image: spellDownImg,
    },
};

export const aggregationVariables = Object.keys(aggregationVariableInfos) as AggregationVariable[];

export type ValueAggregation = {
    deaths: number;
    focusing: number;
    spellFireball: number;
    spellUp: number;
    spellDown: number;
    damageTaken: number;
};

const createEmptyAggregation = (): ValueAggregation => ({
    deaths: 0,
    focusing: 0,
    spellFireball: 0,
    spellUp: 0,
    spellDown: 0,
    damageTaken: 0,
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

    for (const event of recording.events) {
        if (event instanceof HeroStateEvent && event.field.name === 'dead') {
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
