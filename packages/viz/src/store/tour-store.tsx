import { createMemo, createSignal, untrack } from 'solid-js';

export function hkMapRoomRectClass({ gameObjectName }: { gameObjectName: string }) {
    return 'hk-map-room-react_' + gameObjectName;
}

const tourLength = 10;
const [currentStepIndex, setCurrentStepIndex] = createSignal<number>(-1);
const isOpen = createMemo(() => currentStepIndex() !== -1);

function changeCurrentStepIndex(index: number) {
    untrack(() => {
        if (index === currentStepIndex()) return;

        setCurrentStepIndex(index);
    });
}

function close() {
    changeCurrentStepIndex(-1);
}

function next() {
    untrack(() => {
        const _currentStepIndex = currentStepIndex();

        if (_currentStepIndex + 1 >= tourLength) {
            close();
            return;
        } else {
            changeCurrentStepIndex(_currentStepIndex + 1);
        }
    });
}

function back() {
    untrack(() => {
        const _currentStepIndex = currentStepIndex();
        if (_currentStepIndex === 0) {
            close();
        } else {
            changeCurrentStepIndex(_currentStepIndex - 1);
        }
    });
}

function startTour() {
    changeCurrentStepIndex(0);
}

export const tourStore = {
    currentStepIndex,
    isOpen,
    close,
    next,
    back,
    startTour,
    tourLength,
};
