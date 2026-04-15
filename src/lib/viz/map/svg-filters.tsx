import { type Component } from 'solid-js';

export const HoverOutlineFilter: Component & { id: string; url: string } = Object.assign(
	() => {
		return (
			<filter id="hover_mask_filter">
				<feComponentTransfer>
					<feFuncA type="linear" slope={10} intercept={-2} />
				</feComponentTransfer>
				<feGaussianBlur stdDeviation={0.1} />
				<feComponentTransfer>
					<feFuncA type="linear" slope={10} intercept={-1.5} />
				</feComponentTransfer>
			</filter>
		);
	},
	{ id: 'hover_mask_filter', url: 'url(#hover_mask_filter)' },
);
