import { useSearchParams, type ReadonlyURLSearchParams } from 'next/navigation';
import { useState } from 'react';
import { create } from 'zustand';
import { combine, subscribeWithSelector } from 'zustand/middleware';
import { assertNever } from '~/lib/utils/utils';
import { playerDataFields } from '~/lib/viz/player-data/player-data';
import { type CombinedRecording } from '~/lib/viz/recording-files/recording';
import {
    recordingSplitGroups,
    type RecordingSplit,
    type RecordingSplitGroup,
} from '~/lib/viz/recording-files/recording-splits';
import { type AggregatedRunData, type AggregationVariable } from '~/lib/viz/recording-files/run-aggregation-store';
import { RoomColorCurve, RoomColorCurveExponential, RoomColorCurveLinear } from './_room-color-curve';

export type RoomVisibility = 'all' | 'visited' | 'visited-animated';
export type TraceVisibility = 'all' | 'animated' | 'hide';
export type RoomColorMode = 'area' | '1-var';
export type MainCardTab = 'overview' | 'map';
export type DisplayVersion = 'v1' | 'vnext';

export function displayVersion(value: string | null): DisplayVersion {
    if (value === '1') return 'v1';
    return 'vnext';
}

const EMPTY_ARRAY = [] as const;

function createViewOptionsStore(searchParams: ReadonlyURLSearchParams) {
    console.log(searchParams.get('v'), searchParams);
    return create(
        subscribeWithSelector(
            combine(
                {
                    displayVersion: displayVersion(searchParams.get('v')),
                    roomVisibility: 'visited' as RoomVisibility,
                    roomsVisible: EMPTY_ARRAY as readonly string[] | 'all',
                    traceVisibility: 'animated' as TraceVisibility,
                    isAnythingAnimating: true as boolean,
                    isPlaying: false as boolean,
                    animationMsIntoGame: 0,
                    animationSpeedMultiplier: 100,
                    recording: null as CombinedRecording | null,
                    isSteelSoul: false as boolean,
                    aggregatedRunData: null as AggregatedRunData | null,
                    timeFrame: { min: 0, max: 0 },
                    traceAnimationLengthMs: 1000 * 60 * 4,
                    selectedRoom: null as string | null,
                    hoveredRoom: null as string | null,
                    selectedRoomPinned: false,

                    hoveredMsIntoGame: null as number | null,

                    viewNeverHappenedAggregations: false,

                    roomColorMode: 'area' as RoomColorMode,
                    roomColorVar1: 'firstVisitMs' as AggregationVariable,
                    roomColorVar1Curve: RoomColorCurveLinear as RoomColorCurve,

                    extraChartsTimeBounds: [0, 0] as readonly [number, number],
                    extraChartsFollowAnimation: true,
                    mainCardTab: 'overview' as MainCardTab,

                    visibleSplitGroups: recordingSplitGroups.filter((it) => it.defaultShown),
                    filteredSplits: EMPTY_ARRAY as readonly RecordingSplit[],
                    nextSplitIndex: -1,

                    showAreaNames: true,
                    showSubAreaNames: true,
                },
                (set, get) => {
                    function handleAnyAnimationVisiblityChanged() {
                        const {
                            traceVisibility,
                            roomVisibility,
                            isAnythingAnimating,
                            isPlaying,
                            extraChartsFollowAnimation,
                        } = get();
                        const newIsAnythingAnimating =
                            traceVisibility === 'animated' || roomVisibility === 'visited-animated';
                        if (newIsAnythingAnimating !== isAnythingAnimating) {
                            set({ isAnythingAnimating: newIsAnythingAnimating });
                        }
                        if (!newIsAnythingAnimating && isPlaying) {
                            setIsPlaying(false);
                            setAnimationMsIntoGame(get().timeFrame.max);
                        }
                        if (newIsAnythingAnimating != isAnythingAnimating && extraChartsFollowAnimation) {
                            setDefaultExtraChartsTimeBoundsFromFollowAnimation();
                        }
                    }

                    function recalcNextSplit() {
                        set((state) => {
                            const { filteredSplits, animationMsIntoGame, nextSplitIndex: oldNextSplitIndex } = state;
                            const nextSplitIndex = filteredSplits?.findIndex(
                                (split, index) =>
                                    split.msIntoGame >= animationMsIntoGame &&
                                    filteredSplits[index + 1]?.msIntoGame !== split.msIntoGame,
                            );

                            return { nextSplitIndex };
                        });
                    }

                    function refilterSplitGroups() {
                        set((state) => {
                            const { recording, visibleSplitGroups } = state;
                            const filteredSplits =
                                recording?.splits?.filter((it) => visibleSplitGroups.includes(it.group)) ?? EMPTY_ARRAY;
                            return { filteredSplits };
                        });
                        recalcNextSplit();
                    }

                    function recalcVisibleRooms() {
                        set((state) => {
                            const { roomVisibility, recording, animationMsIntoGame } = state;
                            if (roomVisibility === 'visited-animated') {
                                return {
                                    roomsVisible:
                                        recording
                                            ?.allPlayerDataEventsOfField(playerDataFields.byFieldName.scenesVisited)
                                            .findLast((it) => it.msIntoGame <= animationMsIntoGame)?.value ??
                                        EMPTY_ARRAY,
                                };
                            } else if (roomVisibility === 'visited') {
                                return {
                                    roomsVisible:
                                        recording?.lastPlayerDataEventOfField(
                                            playerDataFields.byFieldName.scenesVisited,
                                        )?.value ?? EMPTY_ARRAY,
                                };
                            } else if (roomVisibility === 'all') {
                                return { roomsVisible: 'all' };
                            } else {
                                assertNever(roomVisibility);
                            }
                        });
                    }

                    function setRoomVisibility(roomVisibility: RoomVisibility) {
                        set({ roomVisibility });
                        handleAnyAnimationVisiblityChanged();
                        recalcVisibleRooms();
                    }
                    function setTraceVisibility(traceVisibility: TraceVisibility) {
                        set({ traceVisibility });
                        handleAnyAnimationVisiblityChanged();
                    }
                    function setIsPlaying(playing: boolean) {
                        if (
                            playing &&
                            get().animationSpeedMultiplier > 0 &&
                            get().animationMsIntoGame >= get().timeFrame.max
                        ) {
                            setAnimationMsIntoGame(get().timeFrame.min);
                        }
                        if (
                            playing &&
                            get().animationSpeedMultiplier < 0 &&
                            get().animationMsIntoGame <= get().timeFrame.min
                        ) {
                            setAnimationMsIntoGame(get().timeFrame.max);
                        }

                        if (playing && get().mainCardTab === 'overview') {
                            setMainCardTab('map');
                        }

                        set({ isPlaying: playing });
                    }
                    function togglePlaying() {
                        setIsPlaying(!get().isPlaying);
                    }
                    function setLimitedAnimationMsIntoGame(animationMsIntoGame: number) {
                        const previousAnimationMsIntoGame = get().animationMsIntoGame;
                        const { timeFrame } = get();
                        if (Number.isNaN(animationMsIntoGame) || typeof animationMsIntoGame != 'number') return;

                        if (animationMsIntoGame > timeFrame.max) {
                            animationMsIntoGame = timeFrame.max;
                            setIsPlaying(false);
                        } else if (animationMsIntoGame < timeFrame.min) {
                            animationMsIntoGame = timeFrame.min;
                            setIsPlaying(false);
                        }

                        if (get().extraChartsFollowAnimation) {
                            const previousTimeBounds = get().extraChartsTimeBounds;
                            const diff = animationMsIntoGame - previousAnimationMsIntoGame;

                            const newBounds = [previousTimeBounds[0] + diff, previousTimeBounds[1] + diff] as [
                                number,
                                number,
                            ];
                            if (previousTimeBounds[1] - previousTimeBounds[0] >= timeFrame.max * 0.8) {
                                // bounds are limited if the bounds make up a large part of the original chart.
                                // otherwise it can go outside, so the line stays at the same position.
                                if (newBounds[0] < timeFrame.min) {
                                    const diff = timeFrame.min - newBounds[0];
                                    newBounds[0] += diff;
                                    newBounds[1] += diff;
                                }
                                if (newBounds[1] > timeFrame.max) {
                                    const diff = timeFrame.max - newBounds[1];
                                    newBounds[0] += diff;
                                    newBounds[1] += diff;
                                }
                            }
                            setExtraChartsTimeBounds(newBounds);
                        }

                        set({ animationMsIntoGame });

                        if (get().roomVisibility === 'visited-animated') {
                            recalcVisibleRooms();
                        }
                        recalcNextSplit();
                    }
                    function setAnimationMsIntoGame(animationMsIntoGame: number) {
                        setLimitedAnimationMsIntoGame(animationMsIntoGame);
                    }
                    function incrementAnimationMsIntoGame(increment: number) {
                        setLimitedAnimationMsIntoGame(get().animationMsIntoGame + increment);
                    }
                    function setAnimationSpeedMultiplier(animationSpeedMultiplier: number) {
                        set({ animationSpeedMultiplier });
                    }
                    function setRecording(recording: CombinedRecording | null) {
                        const timeFrame = {
                            min: Math.floor((recording?.firstEvent().msIntoGame ?? 0) / 100) * 100,
                            max: Math.ceil((recording?.lastEvent().msIntoGame ?? 0) / 100) * 100,
                        };
                        const extraChartsTimeBounds = [-4 * 60 * 1000, 1 * 60 * 1000] as const;
                        const permaDeathValue = recording?.lastPlayerDataEventOfField(
                            playerDataFields.byFieldName.permadeathMode,
                        )?.value;
                        const isSteelSoul = permaDeathValue === 1 || permaDeathValue === 2;
                        set({ recording, timeFrame, extraChartsTimeBounds, isSteelSoul });
                        setDefaultExtraChartsTimeBoundsFromFollowAnimation();
                        setAnimationMsIntoGame(timeFrame.max);
                        recalcVisibleRooms();
                        refilterSplitGroups();
                    }
                    function setAggregatedRunData(aggregatedRunData: AggregatedRunData | null) {
                        set({ aggregatedRunData });
                    }
                    function setSelectedRoom(selectedRoom: string | null) {
                        if (get().selectedRoom !== selectedRoom) {
                            set({ selectedRoom });
                        }
                    }
                    function setHoveredRoom(hoveredRoom: string | null) {
                        if (get().hoveredRoom !== hoveredRoom) {
                            set({ hoveredRoom });
                        }
                    }
                    function unsetHoveredRoom(hoveredRoom: string | null) {
                        if (get().hoveredRoom === hoveredRoom) setHoveredRoom(null);
                    }
                    function setHoveredMsIntoGame(hoveredMsIntoGame: number | null) {
                        set({ hoveredMsIntoGame });
                    }
                    function unsetHoveredMsIntoGame(hoveredMsIntoGame: number | null) {
                        if (get().hoveredMsIntoGame === hoveredMsIntoGame) setHoveredMsIntoGame(null);
                    }
                    function setSelectedRoomPinned(selectedRoomPinned: boolean) {
                        set({ selectedRoomPinned });
                    }
                    function setSelectedRoomIfNotPinned(selectedRoom: string | null) {
                        if (!get().selectedRoomPinned) setSelectedRoom(selectedRoom);
                    }
                    function togglePinnedRoom(selectedRoom: string | null, firstClickUnpinned = false) {
                        console.log('selectedRoom', selectedRoom);
                        if (get().selectedRoomPinned && get().selectedRoom === selectedRoom) {
                            setSelectedRoomPinned(false);
                        } else if (
                            firstClickUnpinned &&
                            get().selectedRoom !== selectedRoom &&
                            !get().selectedRoomPinned
                        ) {
                            setSelectedRoom(selectedRoom);
                        } else {
                            setSelectedRoom(selectedRoom);
                            setSelectedRoomPinned(true);
                        }
                    }
                    function setRoomColorMode(roomColorMode: RoomColorMode) {
                        set({ roomColorMode });
                    }
                    function cycleRoomColorVar1(roomColorVar1: AggregationVariable) {
                        const { roomColorVar1: currentRoomColorVar1, roomColorMode, roomColorVar1Curve } = get();

                        if (currentRoomColorVar1 === roomColorVar1 && roomColorMode === '1-var') {
                            if (roomColorVar1Curve.type === 'linear' && !isV1()) {
                                set({ roomColorVar1Curve: RoomColorCurveExponential.EXPONENT_2 });
                            } else {
                                set({ roomColorMode: 'area' });
                            }
                        } else {
                            set({
                                roomColorVar1,
                                roomColorMode: '1-var',
                                roomColorVar1Curve: RoomColorCurveLinear,
                            });
                        }
                    }
                    function setRoomColorVar1(roomColorVar1: AggregationVariable) {
                        set({ roomColorVar1 });
                        if (get().roomColorMode === 'area') {
                            set({ roomColorMode: '1-var' });
                        }
                    }
                    function setRoomColorVar1Curve(roomColorVar1Curve: RoomColorCurve) {
                        set({ roomColorVar1Curve });
                    }
                    function setViewNeverHappenedAggregations(viewNeverHappenedAggregations: boolean) {
                        set({ viewNeverHappenedAggregations });
                    }

                    function setExtraChartsTimeBounds(extraChartsTimeBounds: readonly [number, number]) {
                        const previous = get().extraChartsTimeBounds;
                        if (previous[0] === extraChartsTimeBounds[0] && previous[1] === extraChartsTimeBounds[1])
                            return;
                        set({ extraChartsTimeBounds });
                    }

                    function resetExtraChartsTimeBounds() {
                        setExtraChartsTimeBounds([get().timeFrame.min, get().timeFrame.max]);
                    }

                    function setDefaultExtraChartsTimeBoundsFromFollowAnimation() {
                        if (get().extraChartsFollowAnimation && get().isAnythingAnimating) {
                            setExtraChartsTimeBounds([
                                -17 * 60 * 1000 + get().animationMsIntoGame,
                                3 * 60 * 1000 + get().animationMsIntoGame,
                            ]);
                        } else {
                            setExtraChartsTimeBounds([get().timeFrame.min, get().timeFrame.max]);
                        }
                    }

                    function setExtraChartsFollowAnimation(extraChartsFollowAnimation: boolean) {
                        set({ extraChartsFollowAnimation });
                        setDefaultExtraChartsTimeBoundsFromFollowAnimation();
                    }

                    function setMainCardTab(mainCardTab: MainCardTab) {
                        set({ mainCardTab });
                    }

                    function setVisibleSplitGroups(visibleSplitGroups: RecordingSplitGroup[]) {
                        set({ visibleSplitGroups });
                        refilterSplitGroups();
                    }

                    function getHoveredOrSelectedRoom() {
                        return get().hoveredRoom ?? get().selectedRoom;
                    }

                    function isV1() {
                        return get().displayVersion === 'v1';
                    }

                    function setShowAreaNames(showAreaNames: boolean) {
                        set({ showAreaNames });
                    }

                    function setShowSubAreaNames(showSubAreaNames: boolean) {
                        set({ showSubAreaNames });
                    }

                    return {
                        isV1,
                        setRoomVisibility,
                        setTraceVisibility,
                        setIsPlaying,
                        toggleIsPlaying: togglePlaying,
                        setAnimationMsIntoGame,
                        setAnimationSpeedMultiplier,
                        setRecording,
                        setAggregatedRunData,
                        incrementAnimationMsIntoGame,
                        setSelectedRoom,
                        setSelectedRoomPinned,
                        setSelectedRoomIfNotPinned,
                        togglePinnedRoom,
                        setRoomColors: setRoomColorMode,
                        cycleRoomColorVar1,
                        setViewNeverHappenedAggregations,
                        setHoveredRoom,
                        unsetHoveredRoom,
                        setHoveredMsIntoGame,
                        unsetHoveredMsIntoGame,
                        setExtraChartsTimeBounds,
                        resetExtraChartsTimeBounds,
                        setExtraChartsFollowAnimation,
                        setMainCardTab,
                        setVisibleSplitGroups,
                        getHoveredOrSelectedRoom,
                        setRoomColorVar1,
                        setRoomColorVar1Curve,
                        setShowAreaNames,
                        setShowSubAreaNames,
                    };
                },
            ),
        ),
    );
}

export type UseViewOptionsStore = ReturnType<typeof createViewOptionsStore>;

export function useViewOptionsStoreRoot() {
    const searchParams = useSearchParams();
    const [useStore] = useState(() => createViewOptionsStore(searchParams));
    return useStore;
}
