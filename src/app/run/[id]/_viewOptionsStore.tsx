import { useState } from 'react';
import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { ParsedRecording } from '~/lib/viz/recording-files/recording';

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
                animationSpeedMultiplier: 10,
                recording: null as ParsedRecording | null,
                timeFrame: { min: 0, max: 0 },
            },
            (set, get) => {
                function setRoomVisibility(roomVisibility: RoomVisibility) {
                    set({ roomVisibility });
                }
                function setTraceVisibility(traceVisibility: TraceVisibility) {
                    set({ traceVisibility });
                }
                function setIsPlaying(playing: boolean) {
                    set({ isPlaying: playing });
                }
                function togglePlaying() {
                    set({ isPlaying: !get().isPlaying });
                }
                function setLimitedAnimationMsIntoGame(animationMsIntoGame: number) {
                    const { timeFrame } = get();
                    if (isNaN(animationMsIntoGame)) return;

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

                return {
                    setRoomVisibility,
                    setTraceVisibility,
                    setIsPlaying,
                    toggleIsPlaying: togglePlaying,
                    setAnimationMsIntoGame,
                    setAnimationSpeedMultiplier,
                    setRecording,
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
