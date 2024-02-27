import { useSearchParams, type ReadonlyURLSearchParams } from 'next/navigation';
import { useState } from 'react';
import { create } from 'zustand';
import { combine, subscribeWithSelector } from 'zustand/middleware';
import { assertNever } from '~/lib/utils/utils';
import { playerDataFields } from '~/lib/viz/player-data/player-data';
import { type CombinedRecording } from '~/lib/viz/recording-files/recording';
import {
    RecordingSplit,
    recordingSplitGroups,
    type RecordingSplitGroup,
} from '~/lib/viz/recording-files/recording-splits';
import { type AggregatedRunData, type AggregationVariable } from '~/lib/viz/recording-files/run-aggregation-store';

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

                    extraChartsTimeBounds: [0, 0] as readonly [number, number],
                    extraChartsFollowAnimation: true,
                    mainCardTab: 'overview' as MainCardTab,

                    visibleSplitGroups: recordingSplitGroups.filter((it) => it.defaultShown),
                    filteredSplits: EMPTY_ARRAY as readonly RecordingSplit[],
                    nextSplitIndex: -1,
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
                        const { filteredSplits, animationMsIntoGame, nextSplitIndex: oldNextSplitIndex } = get();
                        const nextSplitIndex = filteredSplits?.findIndex(
                            (split, index) =>
                                split.msIntoGame >= animationMsIntoGame &&
                                filteredSplits[index + 1]?.msIntoGame !== split.msIntoGame,
                        );
                        if (nextSplitIndex !== oldNextSplitIndex) {
                            set({ nextSplitIndex });
                        }
                    }

                    function refilterSplitGroups() {
                        const { recording, visibleSplitGroups } = get();
                        const filteredSplits =
                            recording?.splits?.filter((it) => visibleSplitGroups.includes(it.group)) ?? EMPTY_ARRAY;
                        set({ filteredSplits });
                        recalcNextSplit();
                    }

                    function recalcVisibleRooms() {
                        const { roomVisibility, recording, animationMsIntoGame } = get();
                        if (roomVisibility === 'visited-animated') {
                            set({
                                roomsVisible:
                                    recording
                                        ?.allPlayerDataEventsOfField(playerDataFields.byFieldName.scenesVisited)
                                        .findLast((it) => it.msIntoGame <= animationMsIntoGame)?.value ?? EMPTY_ARRAY,
                            });
                        } else if (roomVisibility === 'visited') {
                            set({
                                roomsVisible:
                                    recording?.lastPlayerDataEventOfField(playerDataFields.byFieldName.scenesVisited)
                                        ?.value ?? EMPTY_ARRAY,
                            });
                        } else if (roomVisibility === 'all') {
                            set({ roomsVisible: 'all' });
                        } else {
                            assertNever(roomVisibility);
                        }
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

                        if (get().roomVisibility === 'visited-animated') {
                            recalcVisibleRooms();
                        }
                        recalcNextSplit();

                        set({ animationMsIntoGame });
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
                    function togglePinnedRoom(selectedRoom: string | null) {
                        console.log('selectedRoom', selectedRoom);
                        if (get().selectedRoomPinned && get().selectedRoom === selectedRoom) {
                            setSelectedRoomPinned(false);
                        } else {
                            setSelectedRoom(selectedRoom);
                            setSelectedRoomPinned(true);
                        }
                    }
                    function setRoomColorMode(roomColorMode: RoomColorMode) {
                        set({ roomColorMode });
                    }
                    function setRoomColorVar1(roomColorVar1: AggregationVariable) {
                        if (get().roomColorVar1 === roomColorVar1 && get().roomColorMode === '1-var') {
                            set({ roomColorMode: 'area' });
                        } else {
                            set({ roomColorVar1, roomColorMode: '1-var' });
                        }
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
                    }

                    function getHoveredOrSelectedRoom() {
                        return get().hoveredRoom ?? get().selectedRoom;
                    }

                    function isV1() {
                        return get().displayVersion === 'v1';
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
                        setRoomColorVar1,
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
