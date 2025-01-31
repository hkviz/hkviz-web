import { type Component } from 'solid-js';

type PopoverSide = 'right' | 'left' | 'top' | 'bottom';

export interface Step {
    target: () => string;
    targetFallback?: string;
    popoverSide?: undefined | (() => PopoverSide);
    hidePrevious?: boolean;
    padding?: number;
    content: Component;
    widthByTrigger?: boolean;
    fadeoutShadow?: () => boolean;
    onActivate?: () => void;
    activeEffect?: () => void;
}

export function makeStep(make: () => Step): Step {
    return make();
}
