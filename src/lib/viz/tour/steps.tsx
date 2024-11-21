import { Palette, Play } from 'lucide-solid';
import { untrack, type Component, type JSXElement } from 'solid-js';
import { roomInfoColoringToggleClasses } from '../class-names';
import { HKVizText } from '../hkviz-text';
import {
	animationStore,
	hkMapRoomRectClass,
	mapZoomStore,
	roomColoringStore,
	roomDisplayStore,
	tourStore,
	uiStore,
	viewportStore,
} from '../store';
import { makeStep, type Step } from './step';

const P: Component<{ children: JSXElement }> = (props) => {
	return <p class="mb-3">{props.children}</p>;
};

export const tourSteps: Step[] = [
	{
		target: () => '.getting-started-tour-button',
		hidePrevious: true,
		content: () => (
			<>
				<P>
					Welcome to the <HKVizText /> quick start tour!
				</P>
				<P>You can always reopen it later using this button.</P>
			</>
		),
		onActivate: () => {
			uiStore.activateTab('overview');
		},
		activeEffect: () => {
			if (uiStore.mainCardTab() === 'map') {
				tourStore.next();
			}
		},
	},
	{
		target: () => (viewportStore.isMobileLayout() ? '.map-tab-mobile-layout' : '.map-tab-large-layout'),
		content: () => <>Let{"'"}s start by switching to the Map.</>,
		onActivate: () => {
			uiStore.activateTab('overview');
		},
		activeEffect: () => {
			if (uiStore.mainCardTab() === 'map') {
				tourStore.next();
			}
		},
	},
	{
		target: () => {
			const { mainRoomData } = animationStore.currentSceneEventWithMainMapRoom();
			if (!mainRoomData) {
				return '.hk-main-map-wrapper';
			}

			return '.hk-main-map-wrapper .' + hkMapRoomRectClass(mainRoomData);
		},
		padding: 32,
		content: () => (
			<>
				<P>Hovering over rooms allows you to select them.</P>
				<P>
					Clicking on a room pins it. Once a room is pinned, other rooms can only be selected through
					clicking.
				</P>
			</>
		),
		activeEffect: () => {
			if (roomDisplayStore.selectedScenePinSource() === 'map-room-click') {
				tourStore.next();
			}

			if (uiStore.mainCardTab() === 'overview') {
				tourStore.back();
			}
		},
		onActivate: () => {
			uiStore.activateTab('map');
			mapZoomStore.setEnabled(true);
			mapZoomStore.setTarget('current-zone');
			roomDisplayStore.unpinScene('code');
		},
	},
	makeStep(() => {
		let pinChanges = 0;

		return {
			target: () => '.room-info-pin-button',
			padding: 8,
			content: () => <P>Here, you can also pin and unpin the selected room.</P>,
			activeEffect: () => {
				roomDisplayStore.selectedScenePinned();
				if (roomDisplayStore.selectedScenePinSource() === 'pin-button-click') {
					pinChanges++;
				}

				if (pinChanges >= 2) {
					tourStore.next();
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
				<P>This table shows some statistics about the selected room.</P>
				<P>
					By clicking on one of the coloring-buttons (
					<Palette class="inline-block h-3 w-3" />
					), you can recolor the map based on the selected statistic.
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
				tourStore.next();
			}
		},
	},
	{
		target: () => '.' + roomInfoColoringToggleClasses(roomColoringStore.var1()),
		targetFallback: '.room-infos-card',
		popoverSide: () => (viewportStore.isMobileLayout() ? 'bottom' : 'right'),
		content: () => (
			<>
				<P>A second click exaggerates small values, for better visibility in some cases.</P>
				<P>A third click resets the map to its original colors.</P>
			</>
		),
		onActivate: () => {
			uiStore.activateTab('map');
			if (roomColoringStore.colorMode() === 'area') {
				roomColoringStore.cycleRoomColorVar1('damageTaken');
			}
		},
		activeEffect: () => {
			if (roomColoringStore.colorMode() === 'area') {
				tourStore.next();
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
						This is the animation timeline with color codes below showing the visited areas. Like on the
						map, you can hover over color codes to select a room, and click for pinning the room.
					</P>
					<P>Hold shift while scrubbing on the timeline, to slowly move the animation forward or backward.</P>
					<P>
						Press play (<Play class="inline-block h-3 w-3" />) to look at the player movement and the map
						expanding as it is explored.
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
					tourStore.next();
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
					<P>While animating, the map can automatically follow the player. </P>
					<P>Manually zooming or moving the map automatically disables this feature.</P>
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
					tourStore.next();
				}
			},
		};
	}),
	{
		target: () => (viewportStore.isMobileLayout() ? '.splits-tab-mobile-layout' : '.run-splits'),
		padding: 2,
		content: () => (
			<>
				<P>
					In the splits panel, you can see timestamps of certain events in the gameplay. Click on a split to
					jump directly to it in the timeline.
				</P>
			</>
		),
		onActivate: () => {
			uiStore.activateTab('splits');
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
		target: () => (viewportStore.isMobileLayout() ? '.time-chart-tab-mobile-layout' : '.extra-charts'),
		padding: 2,
		content: () => (
			<>
				<P>
					Lastly, here are some charts showing stats over time. For {"'"}Geo{"'"}, {"'"}Essence{"'"} and more.
					Scroll down to see more charts. The values below the charts and the dotted line on the charts are
					always showing the selected point in the timeline.
				</P>
				<P>That{"'"}s it! Happy exploring!</P>
			</>
		),
		onActivate: () => {
			uiStore.activateTab('time-charts');
		},
	},
];
