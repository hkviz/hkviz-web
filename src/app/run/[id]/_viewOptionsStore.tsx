import { useState } from 'react';
import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { type ParsedRecording } from '~/lib/viz/recording-files/recording';
import { type AggregatedRunData } from '~/lib/viz/recording-files/run-aggregation-store';

export type RoomVisibility = 'all' | 'visited' | 'mapped';
export type TraceVisibility = 'all' | 'animated' | 'hide';

function createViewOptionsStore() {
    return create(
        combine(
            {
                roomVisibility: 'mapped' as RoomVisibility,
                traceVisibility: 'animated' as TraceVisibility,
                isPlaying: false as boolean,
                animationMsIntoGame: 0,
                animationSpeedMultiplier: 50,
                recording: null as ParsedRecording | null,
                aggregatedRunData: null as AggregatedRunData | null,
                timeFrame: { min: 0, max: 0 },
                traceAnimationLengthMs: 1000 * 60 * 4,
                selectedRoom: null as string | null,
                selectedRoomPinned: false,
            },
            (set, get) => {
                function setRoomVisibility(roomVisibility: RoomVisibility) {
                    set({ roomVisibility });
                }
                function setTraceVisibility(traceVisibility: TraceVisibility) {
                    set({ traceVisibility });
                    if (traceVisibility === 'hide' || traceVisibility === 'all') setIsPlaying(false);
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

                    set({ isPlaying: playing });
                }
                function togglePlaying() {
                    setIsPlaying(!get().isPlaying);
                }
                function setLimitedAnimationMsIntoGame(animationMsIntoGame: number) {
                    const { timeFrame } = get();
                    if (Number.isNaN(animationMsIntoGame) || typeof animationMsIntoGame != 'number') return;

                    if (animationMsIntoGame > timeFrame.max) {
                        animationMsIntoGame = timeFrame.max;
                        setIsPlaying(false);
                    } else if (animationMsIntoGame < timeFrame.min) {
                        animationMsIntoGame = timeFrame.min;
                        setIsPlaying(false);
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
                function setRecording(recording: ParsedRecording | null) {
                    const timeFrame = {
                        min: Math.floor((recording?.firstEvent().msIntoGame ?? 0) / 100) * 100,
                        max: Math.ceil((recording?.lastEvent().msIntoGame ?? 0) / 100) * 100,
                    };
                    set({ recording, timeFrame });
                    setLimitedAnimationMsIntoGame(get().animationMsIntoGame);
                }
                function setAggregatedRunData(aggregatedRunData: AggregatedRunData | null) {
                    set({ aggregatedRunData });
                }
                function setSelectedRoom(selectedRoom: string | null) {
                    set({ selectedRoom });
                }
                function setSelectedRoomPinned(selectedRoomPinned: boolean) {
                    console.log(selectedRoomPinned);
                    set({ selectedRoomPinned });
                }
                function setSelectedRoomIfNotPinned(selectedRoom: string | null) {
                    if (!get().selectedRoomPinned) setSelectedRoom(selectedRoom);
                }
                function togglePinnedRoom(selectedRoom: string | null) {
                    if (get().selectedRoomPinned && get().selectedRoom === selectedRoom) {
                        setSelectedRoomPinned(false);
                    } else {
                        setSelectedRoom(selectedRoom);
                        setSelectedRoomPinned(true);
                    }
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
