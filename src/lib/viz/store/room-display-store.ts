import { createHotkey } from '@tanstack/solid-hotkeys';
import * as d3 from 'd3';
import { createContext, createMemo, createSignal, useContext, type Accessor } from 'solid-js';
import { PlayerDataTestDataSilk, RoomSpriteVariantSilk } from '~/lib/game-data/silk-data/map-data-silk.types';
import { isRoomDataHollow, isRoomDataSilk } from '~/lib/game-data/specific/room-data-of-game';
import { CombinedRecordingHollow } from '~/lib/parser/recording-files/parser-hollow/recording-hollow';
import { CombinedRecordingSilk } from '~/lib/parser/recording-files/parser-silk/recording-silk';
import { assertNever, mapRoomsHollow, playerDataFieldsHollow, type RoomSpriteVariantHollow } from '../../parser';
import { GameplayStore } from './gameplay-store';
import { PlayerDataAnimationStore } from './player-data-animation-store';

export type RoomVisibility = 'all' | 'visited' | 'visited-animated';
export type RoomPinChangeSource =
	| 'code'
	| 'map-room-click'
	| 'pin-button-click'
	| 'timeline-color-code-click'
	| 'split-click'
	| 'hotkey';

export type RoomHoverSource = 'map' | 'chart' | 'splits' | 'timeline' | 'other';
export type AreaSelectionMode = 'room' | 'zone' | 'all';

export function createRoomDisplayStore(
	playerDataAnimationStore: PlayerDataAnimationStore,
	gameplayStore: GameplayStore,
) {
	const gameModule = gameplayStore.gameModule;

	const [roomVisibility, setRoomVisibility] = createSignal<RoomVisibility>('visited-animated');
	const [selectedSceneName, setSelectedSceneName] = createSignal<string | null>(null);
	const [hoveredSceneName, setHoveredSceneName] = createSignal<string | null>(null);
	const [hoveredSceneNameSource, setHoveredSceneNameSource] = createSignal<RoomHoverSource | null>(null);
	const [selectedScenePinned, setSelectedScenePinned] = createSignal(false);
	const [selectedScenePinSource, setSelectedScenePinSource] = createSignal<RoomPinChangeSource>('code');
	const [areaSelectionMode, setAreaSelectionMode] = createSignal<AreaSelectionMode>('room');

	const [showAreaNames, setShowAreaNames] = createSignal(true);
	const [showSubAreaNames, setShowSubAreaNames] = createSignal(true);

	function reset() {
		setRoomVisibility('visited-animated');
		setSelectedSceneName(null);
		setHoveredSceneName(null);
		setHoveredSceneNameSource(null);
		setSelectedScenePinned(false);
		setSelectedScenePinSource('code');

		setShowAreaNames(true);
		setShowSubAreaNames(true);
	}

	function pinScene(source: RoomPinChangeSource) {
		setSelectedScenePinned(true);
		setSelectedScenePinSource(source);
	}
	function unpinScene(source: RoomPinChangeSource) {
		setSelectedScenePinned(false);
		setSelectedScenePinSource(source);
		const hovered = hoveredSceneName();
		if (hovered) {
			setSelectedSceneName(hovered);
		}
	}

	const selectedRoomZoneFormatted = createMemo(() => {
		const selected = selectedSceneName();
		if (selected == null) return null;
		const room = gameModule()?.getMainRoomDataBySceneName(selected);
		if (!room) return null;
		return room.zoneNameFormatted;
	});

	const hoveredMainRoom = createMemo(() => {
		const hovered = hoveredSceneName();
		return hovered != null ? (gameModule()?.getMainRoomDataBySceneName(hovered)?.sceneName ?? null) : null;
	});

	const roomsVisible: Accessor<ReadonlySet<string> | 'all'> = createMemo(() => {
		const visibility = roomVisibility();
		switch (visibility) {
			case 'all':
				return 'all' as const;
			case 'visited':
				const recording = gameplayStore.recording();
				if (!recording) return new Set<string>();
				if (recording instanceof CombinedRecordingHollow) {
					return new Set(
						recording.lastPlayerDataEventOfField(playerDataFieldsHollow.byFieldName.scenesVisited)?.value ??
							[],
					);
				} else if (recording instanceof CombinedRecordingSilk) {
					return recording.lastPlayerDataEventOfField('scenesVisited')?.value ?? new Set<string>();
				}
				return assertNever(recording);
			case 'visited-animated':
				return new Set(playerDataAnimationStore()?.values?.scenesVisited() ?? []);
			default:
				return assertNever(visibility);
		}
	});

	const selfRoomVisibilityByGameObjectName = new Map<string, Accessor<boolean>>();

	function getSelfVisibilitySignal(gameObjectName: string) {
		const room = gameModule()?.getRoomDataByGameObjectName(gameObjectName);
		const existing = selfRoomVisibilityByGameObjectName.get(gameObjectName);
		if (existing) {
			return existing;
		}
		const gameObjectNameNeededInVisited =
			room && isRoomDataHollow(room) ? (room?.gameObjectNameNeededInVisited ?? gameObjectName) : gameObjectName;
		const isSilk = room && isRoomDataSilk(room);
		const signal = createMemo(() => {
			const visible = roomsVisible();
			if (visible === 'all') return true;
			if (isSilk) {
				const isHidden = room.hideCondition
					? isConditionFulfilledSilkRoomDisplayMode(room.hideCondition)
					: false;
				if (isHidden) return false;
			}

			return visible.has(gameObjectNameNeededInVisited);
		});
		// eslint-disable-next-line solid/reactivity
		selfRoomVisibilityByGameObjectName.set(gameObjectName, signal);
		return signal;
	}

	function isConditionFulfilledSilkRoomDisplayMode(condition: PlayerDataTestDataSilk | null) {
		const dataStore = playerDataAnimationStore();
		if (!dataStore || dataStore.game !== 'silk') return false;
		if (!condition) return true;
		return dataStore.isConditionFulfilled(condition, 'animated');
	}

	const statesByGameObjectName = createMemo(() => {
		const rooms = gameModule()?.mapRooms ?? [];
		return new Map(
			rooms.map((room) => {
				const isHovered = createMemo(
					() => hoveredSceneName() === room.sceneName || hoveredMainRoom() === room.sceneName,
				);
				const isSelected = createMemo(() => selectedSceneName() === room.sceneName);
				const selfIsVisible = getSelfVisibilitySignal(room.gameObjectName);
				const isHollow = isRoomDataHollow(room);
				const isSilk = isRoomDataSilk(room);

				const conditionalOn = isHollow ? room.spritesByVariant.conditional?.conditionalOn : null;
				const conditionalOnVisibility = conditionalOn ? conditionalOn.map(getSelfVisibilitySignal) : [];

				let variant: () => RoomSpriteVariantHollow | RoomSpriteVariantSilk | 'hidden';
				if (isHollow) {
					// oxlint-disable-next-line solid/reactivity
					variant = createMemo<RoomSpriteVariantHollow | 'hidden'>(() => {
						let variant: RoomSpriteVariantHollow;
						const visible = selfIsVisible();
						if (!visible) {
							return 'hidden';
						} else if (conditionalOnVisibility.some((v) => v())) {
							variant = 'conditional';
						} else {
							variant = 'normal';
						}
						if (isRoomDataHollow(room) && room.spritesByVariant[variant]?.alwaysHidden) {
							return 'hidden';
						} else {
							return variant;
						}
					});
				} else if (isSilk) {
					// oxlint-disable-next-line solid/reactivity
					variant = createMemo<RoomSpriteVariantSilk | 'hidden'>(() => {
						const visible = selfIsVisible();

						if (!visible) {
							return 'hidden';
						}

						let variant: RoomSpriteVariantSilk = 'initial';

						for (const v of room.allSprites) {
							if (v.type === 'full') {
								variant = v.variant;
							} else if (v.type === 'alt-full-sprite') {
								if (isConditionFulfilledSilkRoomDisplayMode(v.condition)) {
									variant = v.variant;
									// game uses first sprite that matches:
									break;
								}
							}
						}

						return variant;
					});
				} else {
					// oxlint-disable-next-line solid/reactivity
					variant = createMemo<'hidden'>(() => 'hidden');
				}

				const isVisible = createMemo(() => {
					return variant() !== 'hidden';
				});

				return [room.gameObjectName, { isVisible, isHovered, isSelected, variant }];
			}),
		);
	});

	const zoneVisible = new Map(
		[...d3.group(mapRoomsHollow, (d) => d.mapZone)].map(([zone, rooms]) => {
			return [
				zone,
				// eslint-disable-next-line solid/reactivity
				createMemo(() => rooms.some((r) => statesByGameObjectName().get(r.gameObjectName)?.isVisible())),
			];
		}),
	);

	function setHoveredRoom(name: string | null, source: RoomHoverSource = 'other') {
		setHoveredSceneName(name);
		setHoveredSceneNameSource(name != null ? source : null);
	}
	function unsetHoveredRoom(name: string | null) {
		if (hoveredSceneName() === name) setHoveredRoom(null);
	}
	function setSelectedRoomIfNotPinned(selectedRoom: string | null) {
		if (selectedScenePinned()) return;
		setSelectedSceneName(selectedRoom);
	}
	function togglePinnedRoom(selectedRoom: string | null, source: RoomPinChangeSource, firstClickUnpinned = false) {
		console.log('selectedRoom', selectedRoom);
		if (selectedScenePinned() && selectedSceneName() === selectedRoom) {
			unpinScene(source);
		} else if (firstClickUnpinned && selectedSceneName() !== selectedRoom && !selectedScenePinned()) {
			setSelectedSceneName(selectedRoom);
		} else {
			setSelectedSceneName(selectedRoom);
			pinScene(source);
		}
	}

	createHotkey({ key: 'P' }, () => {
		console.log('hotkey toggle pin', selectedSceneName(), selectedScenePinned());
		togglePinnedRoom(selectedSceneName(), 'hotkey', true);
	});

	createHotkey({ key: 'A' }, () => {
		console.log('hotkey toggle area selection mode');
		setAreaSelectionMode((mode) => {
			if (mode === 'all') return 'zone';
			if (mode === 'zone') return 'room';
			if (mode === 'room') return 'all';
			return assertNever(mode);
		});
	});

	function stateForGameObjectName(gameObjectName: string) {
		return statesByGameObjectName().get(gameObjectName);
	}

	return {
		statesByGameObjectName,
		stateForGameObjectName,
		roomVisibility,
		setRoomVisibility,
		selectedSceneName,
		selectedScenePinned,
		selectedScenePinSource,
		selectedRoomZoneFormatted,
		hoveredSceneName,
		hoveredSceneNameSource,
		zoneVisible,
		showAreaNames,
		setShowAreaNames,
		showSubAreaNames,
		setShowSubAreaNames,
		roomsVisible,
		setSelectedSceneName,
		setHoveredRoom,
		unsetHoveredRoom,
		setSelectedRoomIfNotPinned,
		togglePinnedRoom,
		reset,
		pinScene,
		unpinScene,
		areaSelectionMode,
		setAreaSelectionMode,
		isConditionFulfilledSilkRoomDisplayMode,
	};
}

export type RoomDisplayStore = ReturnType<typeof createRoomDisplayStore>;
export const RoomDisplayStoreContext = createContext<RoomDisplayStore>();
export function useRoomDisplayStore() {
	const store = useContext(RoomDisplayStoreContext);
	if (!store) throw new Error('useRoomDisplayStore must be used within a RoomDisplayStoreContext.Provider');
	return store;
}
