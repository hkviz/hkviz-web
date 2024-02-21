import { useState } from 'react';
import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { playerDataFields } from '~/lib/viz/player-data/player-data';
import { type CombinedRecording } from '~/lib/viz/recording-files/recording';
import { RecordingSplitGroup, recordingSplitGroups } from '~/lib/viz/recording-files/recording-splits';
import { type AggregatedRunData, type AggregationVariable } from '~/lib/viz/recording-files/run-aggregation-store';

export type RoomVisibility = 'all' | 'visited' | 'visited-animated';
export type TraceVisibility = 'all' | 'animated' | 'hide';
export type RoomColorMode = 'area' | '1-var';
export type MainCardTab = 'overview' | 'map';

function createViewOptionsStore() {
    return create(
        combine(
            {
                roomVisibility: 'visited' as RoomVisibility,
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

                viewNeverHappenedAggregations: false,

                roomColorMode: 'area' as RoomColorMode,
                roomColorVar1: 'firstVisitMs' as AggregationVariable,

                extraChartsTimeBounds: [0, 0] as readonly [number, number],
                extraChartsFollowAnimation: true,
                mainCardTab: 'overview' as MainCardTab,

                visibleSplitGroups: recordingSplitGroups.filter((it) => it.defaultShown),
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

                function setRoomVisibility(roomVisibility: RoomVisibility) {
                    set({ roomVisibility });
                    handleAnyAnimationVisiblityChanged();
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
                    if (previous[0] === extraChartsTimeBounds[0] && previous[1] === extraChartsTimeBounds[1]) return;
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

                return {
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
                    setExtraChartsTimeBounds,
                    resetExtraChartsTimeBounds,
                    setExtraChartsFollowAnimation,
                    setMainCardTab,
                    setVisibleSplitGroups,
                };
            },
        ),
    );
}

export type UseViewOptionsStore = ReturnType<typeof createViewOptionsStore>;

export function useViewOptionsStoreRoot() {
    const [useStore] = useState(() => createViewOptionsStore());
    return useStore;
}
