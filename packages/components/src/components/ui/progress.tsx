import type { Component, ValidComponent } from 'solid-js';
import { splitProps } from 'solid-js';

import { type PolymorphicProps } from '@kobalte/core/polymorphic';
import {
    type ProgressLabelProps,
    Progress as ProgressPrimitive,
    type ProgressRootProps,
    type ProgressValueLabelProps,
} from '@kobalte/core/progress';

import { Label } from './label';

type RootProps<T extends ValidComponent = 'div'> = PolymorphicProps<T, ProgressRootProps>;

const Progress: Component<RootProps> = (props) => {
    const [, rest] = splitProps(props, ['children']);
    return (
        <ProgressPrimitive {...rest}>
            {props.children}
            <ProgressPrimitive.Track class="bg-secondary relative h-4 w-full overflow-hidden rounded-full">
                <ProgressPrimitive.Fill class="bg-primary h-full w-[var(--kb-progress-fill-width)] flex-1 transition-all" />
            </ProgressPrimitive.Track>
        </ProgressPrimitive>
    );
};

const ProgressLabel: Component<ProgressLabelProps> = (props) => {
    return <ProgressPrimitive.Label as={Label} {...props} />;
};

const ProgressValueLabel: Component<ProgressValueLabelProps> = (props) => {
    return <ProgressPrimitive.ValueLabel as={Label} {...props} />;
};

export { Progress, ProgressLabel, ProgressValueLabel };
