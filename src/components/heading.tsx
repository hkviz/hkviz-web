import { type JSXElement, type ValidComponent } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { cn } from '~/lib/utils';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

type HeadingProps = {
	as?: HeadingLevel;
	id: string;
	class?: string;
	children: JSXElement;
};

const baseClasses =
	'scroll-mt-(--scroll-margin-top) target:bg-amber-400/70 dark:target:bg-amber-400/30 -ml-2 px-2 rounded max-w-fit';

const levelClasses: Record<HeadingLevel, string> = {
	h1: 'font-serif font-bold tracking-tight',
	h2: 'font-serif font-bold tracking-tight',
	h3: 'font-serif font-bold tracking-tight',
	h4: 'font-serifMixedCase',
	h5: 'font-serifMixedCase',
	h6: 'font-serifMixedCase',
};

export function Heading(props: HeadingProps) {
	const tag = () => (props.as ?? 'h2') as ValidComponent;

	return (
		<Dynamic component={tag()} id={props.id} class={cn(baseClasses, levelClasses[props.as ?? 'h2'], props.class)}>
			<a
				aria-hidden="true"
				tabindex="-1"
				class="hash-link p-2 no-underline opacity-50 hover:text-zinc-800 lg:ml-[calc(-1ch-1rem)] dark:hover:text-zinc-200"
				target="_self"
				href={`#${props.id}`}
			>
				<span class="icon icon-link" />
			</a>
			{props.children}
		</Dynamic>
	);
}
