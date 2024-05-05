import { computed, effect, signal, untracked } from '@preact/signals-react';
import { Palette, Play } from 'lucide-react';
import { HKVizText } from '~/app/_components/hkviz-text';
import { roomInfoColoringToggleClasses } from '~/app/run/[id]/_room_infos';
import { asReadonlySignal } from '../../utils/signals';
import { hkMapRoomRectClass } from '../../viz/charts/hk-map-rooms';
import { animationStore } from '../animation-store';
import { mapZoomStore } from '../map-zoom-store';
import { roomColoringStore } from '../room-coloring-store';
import { roomDisplayStore } from '../room-display-store';
import { uiStore } from '../ui-store';
import { viewportStore } from '../viewport-store';
import { makeStep, type Step } from './step';

function P({ children }: { children: React.ReactNode }) {
    return <p className="mb-3">{children}</p>;
}

const steps: Step[] = [
    {
        target: '.getting-started-tour-button',
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
            if (uiStore.mainCardTab.value === 'map') {
                next();
            }
        },
    },
    {
        target: computed(() =>
            viewportStore.isMobileLayout.value ? '.map-tab-mobile-layout' : '.map-tab-large-layout',
        ),
        content: () => <>Let{"'"}s start by switching to the Map.</>,
        onActivate: () => {
            uiStore.activateTab('overview');
        },
        activeEffect: () => {
            console.log('active effect', uiStore.mobileTab.value);
            if (uiStore.mainCardTab.value === 'map') {
                next();
            }
        },
    },
    {
        target: computed(() => {
            const { mainRoomData } = animationStore.currentSceneEventWithMainMapRoom.value;
            if (!mainRoomData) {
                return '.hk-main-map-wrapper';
            }

            return '.hk-main-map-wrapper .' + hkMapRoomRectClass(mainRoomData);
        }),
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
            if (roomDisplayStore.selectedScenePinSource.value === 'map-room-click') {
                next();
            }

            if (uiStore.mainCardTab.value === 'overview') {
                back();
            }
        },
        onActivate: () => {
            uiStore.activateTab('map');
            mapZoomStore.enabled.value = true;
            mapZoomStore.target.value = 'current-zone';
        },
    },
    makeStep(() => {
        let pinChanges = 0;

        return {
            target: '.room-info-pin-button',
            content: () => <P>Here, you can also pin and unpin the selected room.</P>,
            activeEffect: () => {
                roomDisplayStore.selectedScenePinned.value;
                if (roomDisplayStore.selectedScenePinSource.value === 'pin-button-click') {
                    pinChanges++;
                }

                if (pinChanges >= 2) {
                    next();
                }
            },
            onActivate: () => {
                pinChanges = 0;
                uiStore.activateTab('map');
                if (roomDisplayStore.selectedSceneName.peek() == null) {
                    // if no scene has been selected, lets just select one for the user
                    roomDisplayStore.selectedSceneName.value =
                        animationStore.currentSceneEventWithMainMapRoom.value.sceneEvent?.sceneName ?? null;
                }
            },
        };
    }),
    {
        target: '.room-infos-card',
        padding: 2,
        popoverSide: computed(() => (viewportStore.isMobileLayout.value ? 'bottom' : 'right')),
        content: () => (
            <>
                <P>This table shows some statistics about the selected room.</P>
                <P>
                    By clicking on one of the coloring-buttons (
                    <Palette className="inline-block h-3 w-3" />
                    ), you can recolor the map based on the selected statistic.
                </P>
            </>
        ),
        onActivate: () => {
            uiStore.activateTab('map');
            if (roomDisplayStore.selectedSceneName.peek() == null) {
                // if no scene has been selected, lets just select one for the user
                roomDisplayStore.selectedSceneName.value =
                    animationStore.currentSceneEventWithMainMapRoom.value.sceneEvent?.sceneName ?? null;
            }
            if (roomColoringStore.colorMode.peek() !== 'area') {
                roomColoringStore.setRoomColorMode('area');
            }
        },
        activeEffect: () => {
            if (roomColoringStore.colorMode.value !== 'area') {
                next();
            }
        },
    },
    {
        target: computed(() => '.' + roomInfoColoringToggleClasses(roomColoringStore.var1.value)),
        targetFallback: '.room-infos-card',
        popoverSide: computed(() => (viewportStore.isMobileLayout.value ? 'bottom' : 'right')),
        content: () => (
            <>
                <P>A second click exaggerates small values, for better visibility in some cases.</P>
                <P>A third click resets the map to its original colors.</P>
            </>
        ),
        onActivate: () => {
            uiStore.activateTab('map');
            if (roomColoringStore.colorMode.peek() === 'area') {
                roomColoringStore.cycleRoomColorVar1('damageTaken');
            }
        },
        activeEffect: () => {
            if (roomColoringStore.colorMode.value === 'area') {
                next();
            }
        },
    },
    makeStep(() => {
        return {
            target: '.animation-time',
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
                        Press play (<Play className="inline-block h-3 w-3" />) to look at the player movement and the
                        map expanding as it is explored.
                    </P>
                </>
            ),
            onActivate: () => {
                roomDisplayStore.roomVisibility.value = 'visited-animated';
                roomColoringStore.setRoomColorMode('area');
                animationStore.setIsPlaying(false);
                roomDisplayStore.unpinScene('code');
            },
            activeEffect: () => {
                if (animationStore.isPlaying.value === true) {
                    next();
                }
            },
        };
    }),
    makeStep(() => {
        let autoZoomChanges = 0;

        return {
            target: '.auto-zoom-option',
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
                mapZoomStore.enabled.value;
                autoZoomChanges++;

                if (autoZoomChanges >= 4) {
                    next();
                }
            },
        };
    }),
    {
        target: computed(() => (viewportStore.isMobileLayout.value ? '.splits-tab-mobile-layout' : '.run-splits')),
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
                mapZoomStore.enabled.value = true;
            }, 50);
        },
        activeEffect: () => {
            // TODO
        },
    },
    {
        target: computed(() =>
            viewportStore.isMobileLayout.value ? '.time-chart-tab-mobile-layout' : '.extra-charts',
        ),
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

const currentStepIndex = signal<number>(-1);
const isOpen = computed(() => currentStepIndex.value !== -1);
const currentStep = computed(() => steps[currentStepIndex.value]);

let disposeCurrentStepEffect: undefined | (() => void);
function changeCurrentStepIndex(index: number) {
    untracked(() => {
        if (index === currentStepIndex.peek()) return;

        disposeCurrentStepEffect?.();
        disposeCurrentStepEffect = undefined;

        currentStepIndex.value = index;
        const _currentStep = currentStep.peek();
        _currentStep?.onActivate?.();
        console.log('currentStep', index, _currentStep);

        const activeEffect = _currentStep?.activeEffect;

        if (activeEffect) {
            disposeCurrentStepEffect = effect(() => {
                activeEffect();
            });
        }
    });
}

function close() {
    changeCurrentStepIndex(-1);
}

function next() {
    const _currentStepIndex = currentStepIndex.peek();

    if (_currentStepIndex + 1 >= steps.length) {
        close();
        return;
    } else {
        changeCurrentStepIndex(_currentStepIndex + 1);
    }
}

function back() {
    const _currentStepIndex = currentStepIndex.peek();
    if (_currentStepIndex === 0) {
        close();
    } else {
        changeCurrentStepIndex(_currentStepIndex - 1);
    }
}

function startTour() {
    changeCurrentStepIndex(0);
}

export const tourStore = {
    currentStepIndex: asReadonlySignal(currentStepIndex),
    currentStep,
    isOpen,
    close,
    next,
    back,
    steps,
    startTour,
};
