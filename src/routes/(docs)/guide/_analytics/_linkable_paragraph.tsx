import { createEffect, createSignal, type JSXElement } from 'solid-js';
import { cn } from '~/lib/utils';

export function LinkableSpan(props: {
	children: JSXElement;
	id: string;
	class?: string;
	initialScrollMargin?: number;
}) {
	const [scrollMargin, setScrollMargin] = createSignal(props.initialScrollMargin ?? 0);
	let ref!: HTMLSpanElement;

	createEffect(() => {
		function calcScrollMargin() {
			// searches for a tag which is a heading in its parent, and parents parent
			let previousHeading: Element | null = ref;
			while (previousHeading && !['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(previousHeading.tagName)) {
				previousHeading =
					previousHeading.previousElementSibling ??
					previousHeading.parentElement?.previousElementSibling ??
					null;
			}

			// if a heading is found, set the scroll margin to the distance between the heading and the linkable paragraph
			const headingRect = previousHeading?.getBoundingClientRect();
			const refRect = ref?.getBoundingClientRect();
			if (headingRect && refRect) {
				setScrollMargin(Math.max(refRect.top - headingRect.top, 0));
			}
		}
		calcScrollMargin();

		window.addEventListener('resize', calcScrollMargin);
		return () => {
			window.removeEventListener('resize', calcScrollMargin);
		};
	});

	return (
		<span
			id={props.id}
			ref={ref}
			class={cn(
				'linkable-paragraph scroll-mt-(--scroll-margin-top) target:bg-amber-400 target:bg-opacity-70 dark:target:bg-opacity-30',
				props.class,
			)}
			style={{
				'scroll-margin-top': `calc(${scrollMargin()}px + var(--scroll-margin-top))`,
			}}
		>
			{props.children}
		</span>
	);
}
