import { type Component } from 'solid-js';

export const OutlineFilter: Component = () => {
    return (
        <filter id="hover_mask_filter">
            <feComponentTransfer>
                <feFuncA type="linear" slope={10} intercept={-4} />
            </feComponentTransfer>
            <feGaussianBlur stdDeviation={0.1} />
            <feComponentTransfer>
                <feFuncA type="linear" slope={10} intercept={-2.5} />
            </feComponentTransfer>
        </filter>
    );
};
