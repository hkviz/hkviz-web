import { create } from 'zustand';
import { combine } from 'zustand/middleware';

export const useConsentFormStore = create(
    combine({ futureContactOk: false, keepDataAfterStudyConducted: false, over18: false }, (set, get) => {
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
        function setOver18(over18: boolean) {
            set((state) => ({
                ...state,
                over18,
            }));
        }
        return { setFutureContactOk, setKeepDataAfterStudyConducted, setOver18 };
    }),
);
