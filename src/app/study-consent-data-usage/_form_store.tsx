import { create } from 'zustand';
import { combine } from 'zustand/middleware';

export const useConsentFormStore = create(
    combine({ futureParticipate: false, keepDataAfterStudy: false }, (set, get) => {
        function setFutureParticipate(futureParticipate: boolean) {
            set((state) => ({
                ...state,
                futureParticipate,
            }));
        }
        function setKeepDataAfterStudy(keepDataAfterStudy: boolean) {
            set((state) => ({
                ...state,
                keepDataAfterStudy,
            }));
        }
        return { setFutureParticipate, setKeepDataAfterStudy };
    }),
);
