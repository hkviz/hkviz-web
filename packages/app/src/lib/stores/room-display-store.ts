import {
    mainRoomDataBySceneName,
    playerDataFields,
    roomData,
    roomDataByGameObjectName,
    type RoomSpriteVariant,
} from '@hkviz/parser';
import { roomDisplayStore as roomDisplayStoreSolid } from '@hkviz/viz';
import { computed, type ReadonlySignal } from '@preact/signals-react';
import * as d3 from 'd3';
import { gameplayStore } from './gameplay-store';
import { playerDataAnimationStore } from './player-data-animation-store';

const selectedRoomZoneFormatted = computed(() => {
    const selected = roomDisplayStoreSolid.selectedSceneName.valuePreact;
    if (selected == null) return null;
    const room = mainRoomDataBySceneName.get(selected);
    if (!room) return null;
    return room.zoneNameFormatted;
});

const hoveredMainRoom = computed(() => {
    const hovered = roomDisplayStoreSolid.hoveredSceneName.valuePreact;
    return hovered != null ? mainRoomDataBySceneName.get(hovered)?.sceneName ?? null : null;
});

const roomsVisible: ReadonlySignal<ReadonlySet<string> | 'all'> = computed(() => {
    switch (roomDisplayStoreSolid.roomVisibility.valuePreact) {
        case 'all':
            return 'all' as const;
        case 'visited':
            return new Set(
                gameplayStore.recording.valuePreact?.lastPlayerDataEventOfField(
                    playerDataFields.byFieldName.scenesVisited,
                )?.value ?? [],
            );
        case 'visited-animated':
            return new Set(playerDataAnimationStore.currentValues.scenesVisited.value ?? []);
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
            () =>
                roomDisplayStoreSolid.hoveredSceneName.valuePreact === room.sceneName ||
                hoveredMainRoom.value === room.sceneName,
        );
        const isSelected = computed(() => roomDisplayStoreSolid.selectedSceneName.valuePreact === room.sceneName);
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

export const roomDisplayStore = {
    ...roomDisplayStoreSolid,
    statesByGameObjectName,
    selectedRoomZoneFormatted,
    zoneVisible,
    roomsVisible,
};
