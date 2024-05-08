import { computed, signal } from '@preact/signals-react';

export type ZoomFollowTarget = 'current-zone' | 'visible-rooms' | 'player-movement' | 'recent-scenes';

const target = signal<ZoomFollowTarget>('current-zone');
const enabled = signal(true);
const transition = signal(true);
const tempDisabled = signal(false);

const transitionSpeed = signal(100);

function reset() {
    target.value = 'current-zone';
    enabled.value = true;
    transition.value = true;
    tempDisabled.value = false;
    transitionSpeed.value = 100;
}

const shouldDoTransition = computed(() => {
    return enabled.value && transition.value && !tempDisabled.value;
});

export const mapZoomStore = {
    target,
    enabled,
    transition,
    tempDisabled,
    shouldDoTransition,
    transitionSpeed,
    reset,
};
