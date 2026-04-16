import * as d3 from 'd3';
import {
	createEffect,
	createMemo,
	createSignal,
	createUniqueId,
	onMount,
	Show,
	untrack,
	type Component,
} from 'solid-js';
import { cn } from '~/lib/utils';
import { mapRoomsHollow, mapVisualExtends, RoomDataHollow } from '../../parser';
import { createElementSize } from '../canvas';
import { useLayoutPanelContextOrNull } from '../layout/layout-panel-context';
import { LayoutPanelTypeProps } from '../layout/layout-panel-props';
import { useGameplayStore } from '../store/gameplay-store';
import { useMapZoomStore } from '../store/map-zoom-store';
import { useRoomDisplayStore } from '../store/room-display-store';
import { useUiStore } from '../store/ui-store';
import { MapLegend } from './legend';
import { MapOverlayOptions } from './map-overlay-options';
import { MapViewRooms } from './map-view-rooms';
import { HkMapTexts } from './map-view-texts';
import { createMapViewZoom } from './map-view-zoom';
import { HoverOutlineFilter } from './svg-filters';
import { HKMapTraces } from './traces-canvas';

export interface MapViewProps extends LayoutPanelTypeProps {
	class?: string;
}

export const MapView: Component<MapViewProps> = (props: MapViewProps) => {
	const uiStore = useUiStore();
	const roomDisplayStore = useRoomDisplayStore();
	const gameplayStore = useGameplayStore();
	const mapZoomStore = useMapZoomStore();
	const panelContext = useLayoutPanelContextOrNull();
	const isCollapsed = () => panelContext?.isCollapsed() ?? false;
	const mapInstructionsId = createUniqueId();
	const [liveMapStatus, setLiveMapStatus] = createSignal(
		'Map focused. Use arrow keys to move between nearby rooms, Enter or Space to toggle pin, Tab to leave map.',
	);
	const [activeSceneName, setActiveSceneName] = createSignal<string | null>(null);
	const [previousActiveSceneName, setPreviousActiveSceneName] = createSignal<string | null>(null);

	const visibleRooms = createMemo(() => {
		return mapRoomsHollow.filter((room) => {
			const state = roomDisplayStore.stateForGameObjectName(room.gameObjectName);
			return state?.isVisible() ?? false;
		});
	});

	const roomBySceneName = createMemo(() => new Map(mapRoomsHollow.map((room) => [room.sceneName, room])));

	function roomSemanticName(sceneName: string) {
		const room = roomBySceneName().get(sceneName);
		return room?.roomNameFormatted ?? sceneName;
	}

	function centerOfRoom(room: RoomDataHollow) {
		return {
			x: room.visualBoundsAllSprites.min.x + room.visualBoundsAllSprites.size.x / 2,
			y: room.visualBoundsAllSprites.min.y + room.visualBoundsAllSprites.size.y / 2,
		};
	}

	function chooseInitialActiveRoom() {
		const selectedScene = roomDisplayStore.selectedSceneName();
		if (selectedScene && roomBySceneName().has(selectedScene)) {
			return selectedScene;
		}
		const hoveredScene = roomDisplayStore.hoveredSceneName();
		if (hoveredScene && roomBySceneName().has(hoveredScene)) {
			return hoveredScene;
		}
		return visibleRooms()[0]?.sceneName ?? mapRoomsHollow[0]?.sceneName ?? null;
	}

	createEffect(() => {
		if (activeSceneName()) return;
		setActiveSceneName(chooseInitialActiveRoom());
	});

	createEffect(() => {
		const selected = roomDisplayStore.hoveredSceneName();
		untrack(() => {
			if (selected) {
				setLiveMapStatus(`${roomSemanticName(selected)} selected. Press Enter or Space to pin.`);
			}
		});
	});

	createEffect(() => {
		const pinned = roomDisplayStore.selectedScenePinned();
		untrack(() => {
			const selected = roomDisplayStore.selectedSceneName();
			if (pinned) {
				setLiveMapStatus(`${roomSemanticName(selected ?? '')} pinned.`);
			} else {
				setLiveMapStatus(`${roomSemanticName(selected ?? '')} unpinned.`);
			}
		});
	});

	function setKeyboardActiveRoom(sceneName: string) {
		setPreviousActiveSceneName(activeSceneName());
		setActiveSceneName(sceneName);
		roomDisplayStore.setHoveredRoom(sceneName, 'map');
		roomDisplayStore.setSelectedRoomIfNotPinned(sceneName);
	}

	type Direction = 'up' | 'down' | 'left' | 'right';
	type ScoredCandidate = { room: RoomDataHollow; score: number };

	function findNextRoomInDirection(currentSceneName: string, direction: Direction) {
		const currentRoom = roomBySceneName().get(currentSceneName);
		if (!currentRoom) return null;

		const from = centerOfRoom(currentRoom);
		const candidates = visibleRooms().filter((room) => room.sceneName !== currentSceneName);
		const scoredCandidates: ScoredCandidate[] = [];
		const DIRECTIONAL_CONE_RATIO = 1.6;

		for (const candidate of candidates) {
			const to = centerOfRoom(candidate);
			const dx = to.x - from.x;
			const dy = to.y - from.y;

			const primary = direction === 'right' ? dx : direction === 'left' ? -dx : direction === 'down' ? dy : -dy;
			if (primary <= 0) continue;

			const perpendicular = direction === 'left' || direction === 'right' ? Math.abs(dy) : Math.abs(dx);
			if (perpendicular > primary * DIRECTIONAL_CONE_RATIO) continue;

			const distance = Math.hypot(dx, dy);
			const score = distance + perpendicular * 0.8;
			scoredCandidates.push({ room: candidate, score });
		}

		scoredCandidates.sort((a, b) => a.score - b.score);

		if (scoredCandidates.length === 0) return null;

		// prevent circles between 2 rooms.
		const bestRoom = scoredCandidates[0]!.room;
		const previousRoomScene = previousActiveSceneName();
		if (scoredCandidates.length > 1 && previousRoomScene && bestRoom.sceneName === previousRoomScene) {
			return scoredCandidates[1]!.room;
		}

		return bestRoom;
	}

	function handleMapKeyDown(event: KeyboardEvent) {
		if (event.defaultPrevented) return;

		const eventTarget = event.target;
		if (eventTarget instanceof Element && eventTarget.closest('[data-map-interactive-control="true"]')) {
			return;
		}

		const currentScene = activeSceneName() ?? chooseInitialActiveRoom();
		if (!currentScene) return;

		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			roomDisplayStore.togglePinnedRoom(currentScene, 'map-room-click');
			return;
		}

		const direction: Direction | null =
			event.key === 'ArrowUp'
				? 'up'
				: event.key === 'ArrowDown'
					? 'down'
					: event.key === 'ArrowLeft'
						? 'left'
						: event.key === 'ArrowRight'
							? 'right'
							: null;

		if (!direction) return;
		event.preventDefault();

		const nextRoom = findNextRoomInDirection(currentScene, direction);
		if (!nextRoom) {
			setLiveMapStatus(`No room ${direction} of ${roomSemanticName(currentScene)}.`);
			return;
		}

		setKeyboardActiveRoom(nextRoom.sceneName);
	}

	const zoom = d3
		.zoom<SVGSVGElement, unknown>()
		.scaleExtent([0.25, 10])
		.translateExtent([
			[
				mapVisualExtends.min.x - mapVisualExtends.size.x * 0.5,
				mapVisualExtends.min.y - mapVisualExtends.size.y * 0.5,
			],
			[
				mapVisualExtends.max.x + mapVisualExtends.size.x * 0.5,
				mapVisualExtends.max.y + mapVisualExtends.size.y * 0.5,
			],
		])
		.on('zoom', (event) => {
			if (event.sourceEvent) {
				mapZoomStore.setEnabled(false);
			}

			rootGD3.attr('transform', event.transform);
			mapZoomStore.setTransform({
				offsetX: event.transform.x,
				offsetY: event.transform.y,
				scale: event.transform.k,
			});
		});

	const rootG = (
		<g data-group="root">
			{/* <Switch>
				<Match when={gameplayStore.game() === 'silk'}>
					<SilkMapRooms />
				</Match>
				<Match when={gameplayStore.game() === 'hollow'}> */}
			<MapViewRooms
				rooms={gameplayStore.gameModule()?.map.rooms ?? []}
				onMouseOver={(_, r) => {
					setActiveSceneName(r.sceneName);
					roomDisplayStore.setSelectedRoomIfNotPinned(r.sceneName);
					roomDisplayStore.setHoveredRoom(r.sceneName, 'map');
					setLiveMapStatus(`${roomSemanticName(r.sceneName)} selected. Press Enter or Space to pin.`);
				}}
				onMouseOut={(_, r) => {
					roomDisplayStore.unsetHoveredRoom(r.sceneName);
				}}
				onClick={(_, r) => {
					console.log('clicked room', r);
					// if (event.pointerType !== 'touch') {
					roomDisplayStore.togglePinnedRoom(r.sceneName, 'map-room-click');
					// } else {
					// setSelectedRoomPinned(false);
					// setSelectedRoomIfNotPinned(r.sceneName);
					// }
				}}
			/>
			<HkMapTexts />
			{/* </Match>
			</Switch>*/}
		</g>
	) as SVGGElement;
	const rootGD3 = d3.select(rootG);

	const svg = (
		<svg
			class="absolute inset-0"
			width={1000}
			height={1000}
			viewBox={mapVisualExtends.toD3ViewBox().toString()}
			preserveAspectRatio="xMidYMid meet"
		>
			<defs>
				<HoverOutlineFilter />
			</defs>
			{rootG}
		</svg>
	) as SVGSVGElement;

	const svgD3 = d3.select(svg);
	onMount(() => {
		svgD3.call(zoom);
	});

	const container = (
		<div
			class={cn('hk-main-map-wrapper relative', props.class)}
			role="region"
			tabIndex={0}
			aria-label="Hollow Knight map"
			aria-describedby={mapInstructionsId}
			onKeyDown={handleMapKeyDown}
			onFocus={() => {
				const currentScene = activeSceneName() ?? chooseInitialActiveRoom();
				if (!currentScene) return;
				setKeyboardActiveRoom(currentScene);
				uiStore.showMapIfOverview();
			}}
			onBlur={() => {
				roomDisplayStore.setHoveredRoom(null, 'map');
			}}
		>
			<p id={mapInstructionsId} class="sr-only">
				Interactive map. Use arrow keys to move between nearby rooms.
			</p>
			<p class="sr-only" aria-live="polite" aria-atomic="true">
				{liveMapStatus()}
			</p>
			{svg}
			<HKMapTraces />
			<div class="absolute top-1 right-1 lg:top-10 lg2:top-1" data-map-interactive-control="true">
				<MapLegend />
			</div>
			<Show when={!isCollapsed()}>
				<div class="absolute right-2 bottom-2" data-map-interactive-control="true">
					<MapOverlayOptions />
				</div>
			</Show>
		</div>
	) as HTMLDivElement;

	const containerSize = createElementSize(() => container);
	createEffect(() => {
		const _containerSize = containerSize();
		if (!_containerSize) return;

		svgD3.attr('width', _containerSize.width).attr('height', _containerSize.height);
	});

	createMapViewZoom({
		zoom,
		svg: svgD3,
	});

	// TODO don render on server
	// console.log('hkmap', container);
	return container;
};
