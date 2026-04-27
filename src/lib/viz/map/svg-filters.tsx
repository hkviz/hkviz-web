import { Show, type Component } from 'solid-js';
import { useThemeStore } from '../store/theme-store';

export const HoverOutlineFilter: Component & { id: string; url: string } = Object.assign(
	() => {
		const theme = useThemeStore().currentTheme;

		return (
			<filter id="hover_mask_filter">
				<feComponentTransfer>
					<feFuncA type="linear" slope={10} intercept={-2} />
				</feComponentTransfer>
				<feGaussianBlur stdDeviation={0.1} />
				<feComponentTransfer>
					<feFuncA type="linear" slope={10} intercept={-1.5} />
				</feComponentTransfer>
				<Show when={theme() === 'light'}>
					<feComponentTransfer>
						<feFuncR type="table" tableValues="1 0" />
						<feFuncG type="table" tableValues="1 0" />
						<feFuncB type="table" tableValues="1 0" />
						<feFuncA type="identity" />
					</feComponentTransfer>
				</Show>
			</filter>
		);
	},
	{ id: 'hover_mask_filter', url: 'url(#hover_mask_filter)' },
);
