import { type JSXElement } from 'solid-js';
import { Heading } from '~/components/heading';
import { cn } from '~/lib/utils';

type ChangelogEntryProps = {
	title: string;
	type: 'web' | 'mod';
	version: string; // e.g. "3.3.0" or "1.6.0.0"
	date: string; // ISO date e.g. "2026-03-11"
	children: JSXElement;
};

function entryId(type: 'web' | 'mod', version: string) {
	return `${type}-${version}`;
}

export function ChangelogEntry(props: ChangelogEntryProps) {
	const mod = () => props.type === 'mod';

	return (
		<section class="mt-14 border-t border-border pt-10 first:mt-0 first:border-t-0 first:pt-0">
			<div class="not-prose mb-4">
				<Heading as="h1" id={entryId(props.type, props.version)} class="m-0 text-4xl">
					{props.title}
				</Heading>
				<div class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
					<span
						class={cn(
							'rounded px-2 py-0.5 text-xs font-semibold',
							mod()
								? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
								: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
						)}
					>
						{mod() ? 'Mod' : 'Website'}
					</span>
					<span class="text-sm text-muted-foreground tabular-nums">{props.version}</span>
					<span class="text-sm text-muted-foreground/50">·</span>
					<time class="text-sm text-muted-foreground tabular-nums" dateTime={props.date}>
						{props.date}
					</time>
				</div>
			</div>
			{props.children}
		</section>
	);
}
