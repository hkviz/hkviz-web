import { computed, signal, type ReadonlySignal } from '@preact/signals-react';
import * as d3 from 'd3';
import {
    mainRoomDataBySceneName,
    roomData,
    roomDataByGameObjectName,
    type RoomSpriteVariant,
} from '../viz/map-data/rooms';
import { playerDataFields } from '../viz/player-data/player-data';
import { recording } from './gameplay-state';
import { currentPlayerDataValue } from './player-data-sate';

export type RoomVisibility = 'all' | 'visited' | 'visited-animated';

const roomVisibility = signal<RoomVisibility>('visited-animated');
const selectedSceneName = signal<string | null>(null);
const hoveredSceneName = signal<string | null>(null);

const showAreaNames = signal(true);
const showSubAreaNames = signal(true);

const hoveredMainRoom = computed(() => {
    const hovered = hoveredSceneName.value;
    return hovered ? mainRoomDataBySceneName.get(hovered)?.sceneName ?? null : null;
});

const roomsVisible: ReadonlySignal<ReadonlySet<string> | 'all'> = computed(() => {
    switch (roomVisibility.value) {
        case 'all':
            return 'all' as const;
        case 'visited':
            return new Set(
                recording.value?.lastPlayerDataEventOfField(playerDataFields.byFieldName.scenesVisited)?.value ?? [],
            );
        case 'visited-animated':
            return new Set(currentPlayerDataValue.scenesVisited.value ?? []);
    }
});

const selfRoomVisibilityByGameObjectName = new Map<string, ReadonlySignal<boolean>>();

function getSelfVisibilitySignal(gameObjectName: string) {
    const room = roomDataByGameObjectName.get(gameObjectName);
    const gameObjectNameNeededInVisited = room?.gameObjectNameNeededInVisited ?? gameObjectName;
    const existing = selfRoomVisibilityByGameObjectName.get(gameObjectName);
    if (existing) {
        return existing;
    }
    const signal = computed(() => {
        const visible = roomsVisible.value;
        if (visible === 'all') return true;
        return visible.has(gameObjectNameNeededInVisited);
    });
    selfRoomVisibilityByGameObjectName.set(gameObjectName, signal);
    return signal;
}

function isAnyRoomVisible(gameObjects: readonly string[]) {
    return gameObjects.some((go) => {
        return getSelfVisibilitySignal(go).value;
    });
}

const statesByGameObjectName = new Map(
    roomData.map((room) => {
        const isHovered = computed(
            () => hoveredSceneName.value === room.sceneName || hoveredMainRoom.value === room.sceneName,
        );
        const isSelected = computed(() => selectedSceneName.value === room.sceneName);
        const selfIsVisible = getSelfVisibilitySignal(room.gameObjectName);

        const variant = computed<RoomSpriteVariant | 'hidden'>(() => {
            let variant: RoomSpriteVariant;
            const visible = selfIsVisible.value;
            if (!visible) {
                return 'hidden';
            } else if (
                room.spritesByVariant.conditional &&
                isAnyRoomVisible(room.spritesByVariant.conditional.conditionalOn)
            ) {
                variant = 'conditional';
            } else {
                variant = 'normal';
            }
            if (room.spritesByVariant[variant]?.alwaysHidden) {
                return 'hidden';
            } else {
                return variant;
            }
        });

        const isVisible = computed(() => {
            return variant.value !== 'hidden';
        });

        return [room.gameObjectName, { isVisible, isHovered, isSelected, variant }];
    }),
);

const zoneVisible = new Map(
    [...d3.group(roomData, (d) => d.mapZone)].map(([zone, rooms]) => {
        return [zone, computed(() => rooms.some((r) => statesByGameObjectName.get(r.gameObjectName)!.isVisible.value))];
    }),
);

console.log(zoneVisible);

export const roomDisplayStore = {
    statesByGameObjectName,
    roomVisibility,
    selectedSceneName,
    hoveredSceneName,
    zoneVisible,
    showAreaNames,
    showSubAreaNames,
};
