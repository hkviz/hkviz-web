import { type PopoverContent } from '@/components/ui/popover';
import { type ReadonlySignal } from '@preact/signals-react';
import { type ComponentProps } from 'react';

type PopoverSide = ComponentProps<typeof PopoverContent>['side'];

export interface Step {
    target: string | ReadonlySignal<string>;
    targetFallback?: string;
    popoverSide?: PopoverSide | undefined | ReadonlySignal<PopoverSide | undefined>;
    hidePrevious?: boolean;
    padding?: number;
    content: React.FunctionComponent<object>;
    widthByTrigger?: boolean;
    fadeoutShadow?: ReadonlySignal<boolean>;
    onActivate?: () => void;
    activeEffect?: () => void;
}

export function makeStep(make: () => Step): Step {
    return make();
}
