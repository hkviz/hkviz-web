import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { Recording } from './recording';

export type RunFile =
    | {
          finishedLoading: false;
          fileVersion: number;
          loadingProgress: number | null;
      }
    | {
          finishedLoading: true;
          fileVersion: number;
          loadingProgress: 1;
          recording: Recording;
      };

export type RunFileStoreValue = Record<string, RunFile>;

export const useRunFileStore = create(
    combine({ runs: {} as RunFileStoreValue }, (set) => ({
        setLoaded: (action: { fileVersion: number; runId: string; recording: Recording }) =>
            set((state) => ({
                runs: {
                    ...state.runs,
                    [action.runId]: {
                        finishedLoading: true,
                        loadingProgress: 1,
                        recording: action.recording,
                        fileVersion: action.fileVersion,
                    },
                },
            })),
        setLoadingProgress: (action: { fileVersion: number; runId: string; progress: number | null }) =>
            set((state) => ({
                runs: {
                    ...state.runs,
                    [action.runId]: {
                        finishedLoading: false,
                        loadingProgress: action.progress,
                        fileVersion: action.fileVersion,
                    },
                },
            })),
    })),
);
