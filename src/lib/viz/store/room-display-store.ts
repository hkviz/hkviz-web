import * as d3 from 'd3';
import { createContext, createMemo, createSignal, useContext, type Accessor } from 'solid-js';
import {
	mainRoomDataBySceneName,
	playerDataFields,
	roomData,
	roomDataByGameObjectName,
	type RoomSpriteVariant,
} from '../../parser';
import { PlayerDataAnimationStore } from './player-data-animation-store';
import { GameplayStore } from './gameplay-store';

export type RoomVisibility = 'all' | 'visited' | 'visited-animated';
export type RoomPinChangeSource =
	| 'code'
	| 'map-room-click'
	| 'pin-button-click'
	| 'timeline-color-code-click'
	| 'split-click';

export function createRoomDisplayStore(
	playerDataAnimationStore: PlayerDataAnimationStore,
	gameplayStore: GameplayStore,
) {
	const [roomVisibility, setRoomVisibility] = createSignal<RoomVisibility>('visited-animated');
	const [selectedSceneName, setSelectedSceneName] = createSignal<string | null>(null);
	const [hoveredSceneName, setHoveredSceneName] = createSignal<string | null>(null);
	const [selectedScenePinned, setSelectedScenePinned] = createSignal(false);
	const [selectedScenePinSource, setSelectedScenePinSource] = createSignal<RoomPinChangeSource>('code');

	const [showAreaNames, setShowAreaNames] = createSignal(true);
	const [showSubAreaNames, setShowSubAreaNames] = createSignal(true);

	function reset() {
		setRoomVisibility('visited-animated');
		setSelectedSceneName(null);
		setHoveredSceneName(null);
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
	}

	const selectedRoomZoneFormatted = createMemo(() => {
		const selected = selectedSceneName();
		if (selected == null) return null;
		const room = mainRoomDataBySceneName.get(selected);
		if (!room) return null;
		return room.zoneNameFormatted;
	});

	const hoveredMainRoom = createMemo(() => {
		const hovered = hoveredSceneName();
		return hovered != null ? (mainRoomDataBySceneName.get(hovered)?.sceneName ?? null) : null;
	});

	const roomsVisible: Accessor<ReadonlySet<string> | 'all'> = createMemo(() => {
		switch (roomVisibility()) {
			case 'all':
				return 'all' as const;
			case 'visited':
				return new Set(
					gameplayStore.recording()?.lastPlayerDataEventOfField(playerDataFields.byFieldName.scenesVisited)
						?.value ?? [],
				);
			case 'visited-animated':
				return new Set(playerDataAnimationStore.currentValues.scenesVisited() ?? []);
		}
	});

	const selfRoomVisibilityByGameObjectName = new Map<string, Accessor<boolean>>();

	function getSelfVisibilitySignal(gameObjectName: string) {
		const room = roomDataByGameObjectName.get(gameObjectName);
		const existing = selfRoomVisibilityByGameObjectName.get(gameObjectName);
		if (existing) {
			return existing;
		}
		const gameObjectNameNeededInVisited = room?.gameObjectNameNeededInVisited ?? gameObjectName;
		const signal = createMemo(() => {
			const visible = roomsVisible();
			if (visible === 'all') return true;
			return visible.has(gameObjectNameNeededInVisited);
		});
		// eslint-disable-next-line solid/reactivity
		selfRoomVisibilityByGameObjectName.set(gameObjectName, signal);
		return signal;
	}

	const statesByGameObjectName = new Map(
		roomData.map((room) => {
			const isHovered = createMemo(
				() => hoveredSceneName() === room.sceneName || hoveredMainRoom() === room.sceneName,
			);
			const isSelected = createMemo(() => selectedSceneName() === room.sceneName);
			const selfIsVisible = getSelfVisibilitySignal(room.gameObjectName);

			const conditionalOn = room.spritesByVariant.conditional?.conditionalOn;
			const conditionalOnVisibility = conditionalOn ? conditionalOn.map(getSelfVisibilitySignal) : [];

			const variant = createMemo<RoomSpriteVariant | 'hidden'>(() => {
				let variant: RoomSpriteVariant;
				const visible = selfIsVisible();
				if (!visible) {
					return 'hidden';
				} else if (conditionalOnVisibility.some((v) => v())) {
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

			const isVisible = createMemo(() => {
				return variant() !== 'hidden';
			});

			return [room.gameObjectName, { isVisible, isHovered, isSelected, variant }];
		}),
	);

	const zoneVisible = new Map(
		[...d3.group(roomData, (d) => d.mapZone)].map(([zone, rooms]) => {
			return [
				zone,
				// eslint-disable-next-line solid/reactivity
				createMemo(() => rooms.some((r) => statesByGameObjectName.get(r.gameObjectName)!.isVisible())),
			];
		}),
	);

	function setHoveredRoom(name: string | null) {
		setHoveredSceneName(name);
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

	return {
		statesByGameObjectName,
		roomVisibility,
		setRoomVisibility,
		selectedSceneName,
		selectedScenePinned,
		selectedScenePinSource,
		selectedRoomZoneFormatted,
		hoveredSceneName,
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
	};
}

export type RoomDisplayStore = ReturnType<typeof createRoomDisplayStore>;
export const RoomDisplayStoreContext = createContext<RoomDisplayStore>();
export function useRoomDisplayStore() {
	const store = useContext(RoomDisplayStoreContext);
	if (!store) throw new Error('useRoomDisplayStore must be used within a RoomDisplayStoreContext.Provider');
	return store;
}
