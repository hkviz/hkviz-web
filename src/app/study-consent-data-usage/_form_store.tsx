import { create } from 'zustand';
import { combine } from 'zustand/middleware';

export const useConsentFormStore = create(
    combine({ futureContactOk: false, keepDataAfterStudyConducted: false }, (set, get) => {
        function setFutureContactOk(futureContactOk: boolean) {
            set((state) => ({
                ...state,
                futureContactOk,
            }));
        }
        function setKeepDataAfterStudyConducted(keepDataAfterStudyConducted: boolean) {
            set((state) => ({
                ...state,
                keepDataAfterStudyConducted,
            }));
        }
        return { setFutureContactOk, setKeepDataAfterStudyConducted };
    }),
);
