import { create } from 'zustand';
import { combine } from 'zustand/middleware';

export const useConsentFormStore = create(
    combine({ participate: false, keepDataAfterStudy: false }, (set, get) => {
        function setParticipate(participate: boolean) {
            set((state) => ({
                ...state,
                participate,
            }));
        }
        function setKeepDataAfterStudy(keepDataAfterStudy: boolean) {
            set((state) => ({
                ...state,
                keepDataAfterStudy,
            }));
        }
        return { setParticipate, setKeepDataAfterStudy };
    }),
);
