import { MapIcon, PaletteIcon, PinIcon, PlayIcon } from 'lucide-solid';
import { untrack, type Component, type JSXElement } from 'solid-js';
import { AggregationVariable } from '~/lib/aggregation/aggregation-variable';
import { roomInfoColoringToggleClasses } from '../class-names';
import { HKVizText } from '../hkviz-text';
import { AnimationStore } from '../store/animation-store';
import { MapZoomStore } from '../store/map-zoom-store';
import { RoomColoringStore } from '../store/room-coloring-store';
import { RoomDisplayStore } from '../store/room-display-store';
import { mapViewRoomRectClass } from '../store/tour-store';
import { UiStore } from '../store/ui-store';
import { ViewportStore } from '../store/viewport-store';
import { GeoChartUnitIcon, HealthChartMaskUnitIcon } from '../time-charts/chart-icons';
import { makeStep, type Step } from './step';

const P: Component<{ children: JSXElement }> = (props) => {
	return <p class="mb-3">{props.children}</p>;
};

interface CreateTourStepsInput {
	next: () => void;
	back: () => void;
	roomColoringStore: RoomColoringStore;
	roomDisplayStore: RoomDisplayStore;
	viewportStore: ViewportStore;
	animationStore: AnimationStore;
	uiStore: UiStore;
	mapZoomStore: MapZoomStore;
}

export function createTourSteps({
	next,
	back,
	roomColoringStore,
	roomDisplayStore,
	viewportStore,
	animationStore,
	uiStore,
	mapZoomStore,
}: CreateTourStepsInput): Step[] {
	return [
		{
			target: () => '.getting-started-tour-button',
			hidePrevious: true,
			content: () => (
				<>
					<P>
						Welcome to the <HKVizText /> quick start tour!
					</P>
				</>
			),
			onActivate: () => {
				uiStore.activateTab('overview');
			},
			activeEffect: () => {
				if (uiStore.mainCardTab() === 'map') {
					next();
				}
			},
		},
		{
			target: () => (viewportStore.isMobileLayout() ? '.map-tab-mobile-layout' : '.map-tab-large-layout'),
			content: () => (
				<>
					Switch to the Map tab <MapIcon class="mb-0.5 inline-block h-3.5 w-3.5" /> to continue.
				</>
			),
			onActivate: () => {
				uiStore.activateTab('overview');
			},
			activeEffect: () => {
				if (uiStore.mainCardTab() === 'map') {
					next();
				}
			},
		},
		{
			target: () => {
				const { mainRoomData } = animationStore.currentSceneEventWithMainMapRoom();
				if (!mainRoomData) {
					return '.hk-main-map-wrapper';
				}

				return '.hk-main-map-wrapper .' + mapViewRoomRectClass(mainRoomData);
			},
			padding: 32,
			content: () => (
				<>
					<P>
						Hover over rooms to select them. Click a room to pin it{' '}
						<PinIcon class="mb-0.5 inline-block h-3.5 w-3.5" />.
					</P>
					<P>When pinned, other rooms can only be selected by clicking.</P>
				</>
			),
			activeEffect: () => {
				if (roomDisplayStore.selectedScenePinSource() === 'map-room-click') {
					next();
				}

				if (uiStore.mainCardTab() === 'overview') {
					back();
				}
			},
			onActivate: () => {
				uiStore.activateTab('map');
				mapZoomStore.setEnabled(true);
				mapZoomStore.setTarget('current-area-smooth');
				roomDisplayStore.unpinScene('code');
			},
		},
		makeStep(() => {
			let pinChanges = 0;

			return {
				target: () => '.room-info-pin-button',
				padding: 8,
				content: () => <P>You can also pin or unpin the selected room here.</P>,
				activeEffect: () => {
					roomDisplayStore.selectedScenePinned();
					if (roomDisplayStore.selectedScenePinSource() === 'pin-button-click') {
						pinChanges++;
					}

					if (pinChanges >= 2) {
						next();
					}
				},
				onActivate: () => {
					pinChanges = 0;
					uiStore.activateTab('map');
					if (roomDisplayStore.selectedSceneName() == null) {
						// if no scene has been selected, lets just select one for the user
						roomDisplayStore.setSelectedSceneName(
							animationStore.currentSceneEventWithMainMapRoom().sceneEvent?.sceneName ?? null,
						);
					}
				},
			};
		}),
		{
			target: () => '.room-infos-card',
			padding: 2,
			popoverSide: () => (viewportStore.isMobileLayout() ? 'bottom' : 'right'),
			content: () => (
				<>
					<P>This table shows statistics for the selected room.</P>
					<P>
						Click a coloring button <PaletteIcon class="inline-block h-3 w-3" /> to recolor the map based on
						the chosen statistic.
					</P>
				</>
			),
			onActivate: () => {
				uiStore.activateTab('map');
				untrack(() => {
					if (roomDisplayStore.selectedSceneName() == null) {
						// if no scene has been selected, lets just select one for the user
						roomDisplayStore.setSelectedSceneName(
							animationStore.currentSceneEventWithMainMapRoom().sceneEvent?.sceneName ?? null,
						);
					}
					if (roomColoringStore.colorMode() !== 'area') {
						roomColoringStore.setRoomColorMode('area');
					}
				});
			},
			activeEffect: () => {
				if (roomColoringStore.colorMode() !== 'area') {
					next();
				}
			},
		},
		{
			target: () => '.' + roomInfoColoringToggleClasses(roomColoringStore.var1()),
			targetFallback: '.room-infos-card',
			popoverSide: () => (viewportStore.isMobileLayout() ? 'bottom' : 'right'),
			content: () => (
				<>
					<P>
						Click again <PaletteIcon class="mb-0.5 inline-block h-3.5 w-3.5" /> to increase contrast for
						small values.
					</P>
					<P>Click a third time to reset the map colors.</P>
				</>
			),
			onActivate: () => {
				uiStore.activateTab('map');
				if (roomColoringStore.colorMode() === 'area') {
					roomColoringStore.cycleRoomColorVar1('damageTaken' as AggregationVariable);
				}
			},
			activeEffect: () => {
				if (roomColoringStore.colorMode() === 'area') {
					next();
				}
			},
		},
		makeStep(() => {
			return {
				target: () => '.animation-time',
				widthByTrigger: true,
				padding: 2,
				content: () => (
					<>
						<P>
							Below the timeline, the visited scenes are shown as colored segments. The segments of the
							selected scene, and its area are enlarged.
						</P>
						<P>
							Hold shift while scrubbing on the timeline, to slowly move the animation forward or
							backward.
						</P>
						<P>
							Press play <PlayIcon class="inline-block h-3 w-3" /> to look at the player movement.
						</P>
					</>
				),
				onActivate: () => {
					roomDisplayStore.setRoomVisibility('visited-animated');
					roomColoringStore.setRoomColorMode('area');
					animationStore.setIsPlaying(false);
					roomDisplayStore.unpinScene('code');
				},
				activeEffect: () => {
					if (animationStore.isPlaying() === true) {
						next();
					}
				},
			};
		}),
		makeStep(() => {
			let autoZoomChanges = 0;

			return {
				target: () => '.auto-zoom-option',
				widthByTrigger: true,
				content: () => (
					<>
						<P>
							During animation, the map can automatically follow the player with one of three zoom levels.
						</P>
						<P>Manually zooming or moving the map disables this feature.</P>
					</>
				),
				onActivate: () => {
					uiStore.activateTab('map');
					autoZoomChanges = 0;
				},
				activeEffect: () => {
					mapZoomStore.enabled();
					autoZoomChanges++;

					if (autoZoomChanges >= 4) {
						next();
					}
				},
			};
		}),
		{
			target: () => (viewportStore.isMobileLayout() ? '.chart-tab-mobile-layout' : '.run-splits'),
			padding: 2,
			content: () => (
				<>
					<P>In the splits panel, you can see timestamps for gameplay events.</P>
					<P>Click a split to jump to it in the timeline.</P>
				</>
			),
			onActivate: () => {
				uiStore.activateTab('right');
				animationStore.setIsPlaying(false);
				setTimeout(() => {
					mapZoomStore.setEnabled(true);
				}, 50);
			},
			activeEffect: () => {
				// TODO
			},
		},
		{
			target: () => (viewportStore.isMobileLayout() ? '.chart-tab-mobile-layout' : '.extra-charts'),
			padding: 2,
			content: () => (
				<>
					<P>
						Lastly, these charts show stats over time, such as{' '}
						<GeoChartUnitIcon class="inline max-h-[1em] max-w-[1em]" /> Geo and{' '}
						<HealthChartMaskUnitIcon class="inline max-h-[1em] max-w-[1em]" /> Health.
					</P>
					<P>The values below the charts and the dotted line show the selected point in the timeline.</P>
					<P>You{"'"}re all set. Happy exploring!</P>
				</>
			),
			onActivate: () => {
				uiStore.activateTab('right');
			},
		},
	];
}
