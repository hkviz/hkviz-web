import { createContext, createEffect, createMemo, createSignal, For, JSXElement, useContext } from 'solid-js';
import { assertNever } from '~/lib/parser';
import { cn } from '~/lib/utils';
import { useAnimationStore } from '../store';
import { createRoomMsButtonProps } from '../util/shared-interactions';

export type TimelineListEntryState = 'past' | 'next' | 'future';

export interface TimelineListProps<T> {
	entries: T[];
	getEntryTime: (entry: T) => number;
	getSceneName?: (entry: T) => string | undefined;
	children: (entry: T, state: () => TimelineListEntryState, previousEntry: () => T | undefined) => JSXElement;
}

export function TimelineList<T>(props: TimelineListProps<T>) {
	const animationStore = useAnimationStore();
	const [selectedIndex, setSelectedIndex] = createSignal(0);
	let containerRef: HTMLDivElement | undefined;

	// Compute the next index as a memo
	const nextIndex = createMemo(() => {
		const msIntoGame = animationStore.msIntoGame();

		for (let i = 0; i < props.entries.length; i++) {
			const entry = props.entries[i];
			const previousEntry = i > 0 ? props.entries[i - 1] : undefined;
			const previousTime = previousEntry ? props.getEntryTime(previousEntry) : undefined;
			const entryTime = props.getEntryTime(entry);

			if (entryTime >= msIntoGame && (!previousTime || previousTime < msIntoGame)) {
				return i;
			}
		}
		return -1;
	});

	// Keep selection in sync with the externally computed next index without stealing focus
	createEffect(() => {
		const index = nextIndex();
		setSelectedIndex(index);
	});

	const focusOption = (index: number) => {
		const button = containerRef?.querySelector(`[data-timeline-index="${index}"]`) as HTMLButtonElement | null;
		button?.focus();
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		const currentIndex = selectedIndex();
		let newIndex = currentIndex;

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			newIndex = Math.min(currentIndex + 1, props.entries.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			newIndex = Math.max(currentIndex - 1, 0);
		} else if (e.key === 'Home') {
			e.preventDefault();
			newIndex = 0;
		} else if (e.key === 'End') {
			e.preventDefault();
			newIndex = props.entries.length - 1;
		}

		if (newIndex !== currentIndex) {
			setSelectedIndex(newIndex);
			focusOption(newIndex);
		}
	};

	return (
		<div
			ref={containerRef}
			class="flex shrink grow basis-0 flex-col overflow-x-hidden overflow-y-auto"
			role="listbox"
			tabindex="0"
			aria-orientation="vertical"
			aria-activedescendant={selectedIndex() >= 0 ? `timeline-list-option-${selectedIndex()}` : undefined}
			onFocus={(e) => {
				const relatedTarget = e.relatedTarget as Node | null;
				const enteredFromOutside = !relatedTarget || !e.currentTarget.contains(relatedTarget);
				if (e.target === e.currentTarget && enteredFromOutside && selectedIndex() >= 0) {
					focusOption(selectedIndex());
				}
			}}
			onKeyDown={handleKeyDown}
		>
			<For each={props.entries}>
				{(entry, index) => {
					const previousEntry = () => (index() > 0 ? props.entries[index() - 1] : undefined);
					const state = () => {
						const entryIndex = index();
						const nIdx = nextIndex();
						if (entryIndex < nIdx || nIdx === -1) {
							return 'past';
						} else if (entryIndex === nIdx) {
							return 'next';
						} else {
							return 'future';
						}
					};

					return (
						<TimelineListEntryContext.Provider
							value={{
								entryTime: () => props.getEntryTime(entry),
								sceneName: () => props.getSceneName?.(entry),
								state,
								isSelected: () => selectedIndex() === index(),
								index,
							}}
						>
							{props.children(entry, state, previousEntry)}
						</TimelineListEntryContext.Provider>
					);
				}}
			</For>
		</div>
	);
}

const TimelineListEntryContext = createContext<{
	entryTime: () => number;
	sceneName?: () => string | undefined;
	state: () => TimelineListEntryState;
	isSelected: () => boolean;
	index: () => number;
}>();

export function useTimelineListEntryContext() {
	const context = useContext(TimelineListEntryContext);
	if (!context) {
		throw new Error('useTimelineListEntryContext must be used within a TimelineListEntryContext.Provider');
	}
	return context;
}

export interface TimelineListEntryButtonProps {
	children: JSXElement;
	class?: string;
}

export function TimelineListEntryButton(props: TimelineListEntryButtonProps) {
	const context = useTimelineListEntryContext();

	const hover = createRoomMsButtonProps({
		time: () => ({ msIntoGame: context.entryTime() }),
		room: () => ({
			sceneName: context.sceneName?.(),
			hoverSource: 'splits',
			selectIfNotPinned: true,
		}),
		withClick: true,
	});

	const activeStateClasses = () => {
		const state = context.state();
		const classes =
			state === 'past'
				? 'bg-linear-to-r from-green-300/10 to-green-500/20 dark:from-green-500/10 dark:to-green-500/15'
				: state === 'next'
					? 'bg-linear-to-r from-blue-300/90 to-blue-300/90 dark:from-blue-800/90 dark:to-blue-800/90'
					: state === 'future'
						? ''
						: assertNever(state);
		return classes;
	};

	return (
		<button
			{...hover}
			id={`timeline-list-option-${context.index()}`}
			data-timeline-index={context.index()}
			role="option"
			tabindex={-1}
			aria-selected={context.isSelected()}
			class={cn(activeStateClasses(), 'border-b hover:bg-gray-200 dark:hover:bg-gray-700/50', props.class)}
		>
			{props.children}
		</button>
	);
}
