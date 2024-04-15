import { computed, signal, type ReadonlySignal } from '@preact/signals-react';
import { RoomSpriteVariant, mainRoomDataBySceneName, roomData } from '../viz/map-data/rooms';
import { playerDataFields } from '../viz/player-data/player-data';
import { recording } from './gameplay-state';
import { currentPlayerDataValue } from './player-data-sate';

export type RoomVisibility = 'all' | 'visited' | 'visited-animated';
export type RoomColorMode = 'area' | '1-var';

export const roomVisibility = signal<RoomVisibility>('visited-animated');
export const roomColorMode = signal<RoomColorMode>('area');
export const selectedSceneName = signal<string | null>(null);
export const hoveredSceneName = signal<string | null>(null);

const hoveredMainRoom = computed(() => {
    const hovered = hoveredSceneName.value;
    return hovered ? mainRoomDataBySceneName.get(hovered)?.sceneName ?? null : null;
});

const EMPTY_ARRAY = [] as readonly never[];

const roomsVisible: ReadonlySignal<readonly string[] | 'all'> = computed(() => {
    switch (roomVisibility.value) {
        case 'all':
            return 'all' as const;
        case 'visited':
            return (
                recording.value?.lastPlayerDataEventOfField(playerDataFields.byFieldName.scenesVisited)?.value ??
                EMPTY_ARRAY
            );
        case 'visited-animated':
            return currentPlayerDataValue.scenesVisited.value ?? EMPTY_ARRAY;
    }
});

const selfRoomVisibilityByGameObjectName = new Map(
    roomData.map((room) => {
        const isVisible = computed(() => {
            const visible = roomsVisible.value;
            if (visible === 'all') return true;
            return visible.includes(room.gameObjectNameNeededInVisited);
        });
        return [room.gameObjectName, isVisible];
    }),
);

function isAnyRoomVisible(gameObjects: readonly string[]) {
    return gameObjects.some((go) => {
        const v = selfRoomVisibilityByGameObjectName.get(go);
        return v?.value ?? false;
    });
}

export const roomDisplayStatesByGameObjectName = new Map(
    roomData.map((room) => {
        const isHovered = computed(
            () => hoveredSceneName.value === room.sceneName || hoveredMainRoom.value === room.sceneName,
        );
        const isSelected = computed(() => selectedSceneName.value === room.sceneName);
        const selfIsVisible = selfRoomVisibilityByGameObjectName.get(room.gameObjectName)!;

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
