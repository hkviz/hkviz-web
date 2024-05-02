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
                <P>You can always reopen it later using this button</P>
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
        content: () => <>Lets start by switching to the Map</>,
        onActivate: () => {
            if (uiStore.mainCardTab.peek() === 'map') {
                back();
            }
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
                <P>Clicking on a room pins it, and once pinned, rooms can only be selected through clicking.</P>
            </>
        ),
        activeEffect: () => {
            if (roomDisplayStore.selectedScenePinSource.value === 'map-room-click') {
                next();
            }
        },
        onActivate: () => {
            uiStore.activateTab('map');
        },
    },
    makeStep(() => {
        let pinChanges = 0;

        return {
            target: '.room-info-pin-button',
            content: () => <>Here you can also pin and unpin the selected room.</>,
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
            },
        };
    }),
    {
        target: '.room-infos-card',
        padding: 0,
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
                <P>A second click enhances the visibility of smaller values.</P>
                <P>A third click resets the map to its original colors.</P>
            </>
        ),
        onActivate: () => {
            if (roomColoringStore.colorMode.peek() === 'area') {
                roomColoringStore.cycleRoomColorVar1('geoEarned');
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
            padding: 0,
            content: () => (
                <>
                    <P>
                        This is the animation timeline. Bellow the timeline there are color codes showing the visited
                        areas. Like on the map you can hover to select a room, and click for pinning the room.
                    </P>
                    <P>
                        Press play (<Play className="inline-block h-3 w-3" />) on to look at the player movement and the
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
                    <P>By manually zooming or moving the map, this is disabled automatically.</P>
                </>
            ),
            onActivate: () => {
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
    // {
    //     target: '.animation-time',
    //     widthByTrigger: true,
    //     content: () => (
    //         <>
    //             <P>Below the timeline you can see the color codes for the rooms visited.</P>
    //             <P>
    //                 The color codes of the selected room and its area are shown larger. So you can quickly find when in
    //                 the gameplay it has been visited.
    //             </P>
    //             <P>Hovering over a color code selects the room, if its not pinned. Clicking toggles the room pin.</P>
    //         </>
    //     ),
    //     activeEffect: () => {
    //         if (roomDisplayStore.selectedScenePinSource.value === 'timeline-color-code-click') {
    //             next();
    //         }
    //     },
    // },
    {
        target: '.run-splits',
        widthByTrigger: true,
        padding: 0,
        content: () => (
            <>
                <P>
                    In the splits panel you can see timestamps of certain events in the gameplay. Click a split to jump
                    to it in the timeline.
                </P>
            </>
        ),
        onActivate: () => {
            animationStore.setIsPlaying(false);
        },
        activeEffect: () => {
            // TODO
        },
    },
    {
        target: '.extra-charts',
        widthByTrigger: true,
        padding: 0,
        content: () => (
            <>
                <P>
                    And last, the time charts for {"'"}Geo{"'"}, {"'"}Essence{"'"} and much more. At the top of the
                    charts there are some actions to use, like zooming in and out.
                </P>
                <P>Thats it! Good luck exploring.</P>
            </>
        ),
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
