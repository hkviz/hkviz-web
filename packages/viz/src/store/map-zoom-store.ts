import { createMemo, createSignal } from 'solid-js';

export type ZoomFollowTarget = 'current-zone' | 'visible-rooms';

const [target, setTarget] = createSignal<ZoomFollowTarget>('current-zone');
const [enabled, setEnabled] = createSignal(true);
const [transition, setTransition] = createSignal(true);
const [tempDisabled, setTempDisabled] = createSignal(false);

const [transitionSpeed, setTransitionSpeed] = createSignal(100);

const [transform, setTransform] = createSignal({
    offsetX: 0,
    offsetY: 0,
    scale: 1,
});

function reset() {
    setTarget('current-zone');
    setEnabled(true);
    setTransition(true);
    setTempDisabled(false);
    setTransitionSpeed(100);
    setTransform({ offsetX: 0, offsetY: 0, scale: 1 });
}

const shouldDoTransition = createMemo(() => {
    return enabled() && transition() && !tempDisabled();
});

export const mapZoomStore = {
    target,
    setTarget,
    enabled,
    setEnabled,
    transition,
    setTransition,
    tempDisabled,
    setTempDisabled,
    shouldDoTransition,
    transitionSpeed,
    setTransitionSpeed,
    reset,
    transform,
    setTransform,
};
