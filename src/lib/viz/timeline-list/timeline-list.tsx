import { createVirtualizer, VirtualItem, Virtualizer } from '@tanstack/solid-virtual';
import {
	createContext,
	createEffect,
	createMemo,
	createSignal,
	createUniqueId,
	For,
	JSX,
	JSXElement,
	onCleanup,
	onMount,
	Show,
	untrack,
	useContext,
} from 'solid-js';
import { Button } from '~/components/ui/button';
import { assertNever } from '~/lib/parser';
import { cn } from '~/lib/utils';
import { useAnimationStore } from '../store';
import { createRoomMsButtonProps } from '../util/shared-interactions';

export type TimelineListEntryState = 'past' | 'next' | 'future';

interface TimelineListBaseProps<T> {
	entries: readonly T[];
	getEntryTime: (entry: T) => number;
	getSceneName?: (entry: T) => string | undefined;
	children: (entry: () => T, state: () => TimelineListEntryState, previousEntry: () => T | undefined) => JSXElement;
}

interface TimelineListVirtualizedProps<T> extends TimelineListBaseProps<T> {
	estimateSize: (index: number) => number;
	virtualize: true;
}

interface TimelineListNonVirtualizedProps<T> extends TimelineListBaseProps<T> {
	virtualize: false;
}
export type TimelineListProps<T> = TimelineListVirtualizedProps<T> | TimelineListNonVirtualizedProps<T>;

export function TimelineList<T>(props: TimelineListProps<T>) {
	const id = createUniqueId();
	const animationStore = useAnimationStore();
	const [selectedIndex, setSelectedIndex] = createSignal(0);
	const [containerRef, setContainerRef] = createSignal<HTMLDivElement | undefined>();
	const [isAutoScrollEnabled, setIsAutoScrollEnabled] = createSignal(true);
	const [ignoreScrollEventsUntil, setIgnoreScrollEventsUntil] = createSignal(0);

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

	const nextIndexOrLast = createMemo(() => {
		if (props.entries.length === 0) {
			return -1;
		}

		const index = nextIndex();
		return index === -1 ? props.entries.length - 1 : index;
	});

	const getOptionId = (index: number) => `timeline-list-${id}-option-${index}`;

	const findOptionElement = (index: number, container: HTMLDivElement | undefined = containerRef()) => {
		if (!container) {
			return null;
		}

		const element = document.getElementById(getOptionId(index));
		if (!(element instanceof HTMLElement) || !container.contains(element)) {
			return null;
		}

		return element;
	};

	const isElementVisibleInContainer = (element: HTMLElement, container: HTMLDivElement) => {
		const containerRect = container.getBoundingClientRect();
		const elementRect = element.getBoundingClientRect();
		return elementRect.bottom > containerRect.top && elementRect.top < containerRect.bottom;
	};

	const scrollToIndexProgrammatically = (index: number, behavior: ScrollBehavior) => {
		const container = containerRef();

		setIgnoreScrollEventsUntil(Date.now() + 700);
		if (virtualizer) {
			virtualizer.scrollToIndex(index, { align: 'end', behavior: behavior });
		} else {
			const button = findOptionElement(index, container);
			button?.scrollIntoView({ block: 'end', behavior: behavior });
		}
	};

	const resumeAutoScrollToCurrent = () => {
		setIsAutoScrollEnabled(true);
		const index = nextIndexOrLast();
		if (index >= 0) {
			setSelectedIndex(index);
			scrollToIndexProgrammatically(index, 'smooth');
		}
	};

	// Keep selection in sync with the externally computed next index without stealing focus
	createEffect(() => {
		const index = nextIndexOrLast();
		untrack(() => {
			// dont set when focus is inside the container, otherwise keyboard users get their focus stolen
			const activeElement = document.activeElement;
			const container = containerRef();
			const focusInsideContainer = activeElement && container && container.contains(activeElement);
			if (focusInsideContainer) {
				return;
			}
			setSelectedIndex(index);
		});
	});

	createEffect(() => {
		if (!isAutoScrollEnabled()) {
			return;
		}

		const _entries = props.entries;
		const index = nextIndexOrLast();
		if (index >= 0) {
			scrollToIndexProgrammatically(index, 'smooth');
		}
	});

	const focusOption = (index: number) => {
		const button = findOptionElement(index) as HTMLButtonElement | null;
		if (button) {
			button.focus();
		} else {
			scrollToIndexProgrammatically(index, 'smooth');
			setTimeout(() => {
				const buttonAfterScroll = findOptionElement(index) as HTMLButtonElement | null;
				if (buttonAfterScroll) {
					buttonAfterScroll.focus();
				}
			}, 50);
		}
	};

	const handleScroll = (e: Event) => {
		if (!isAutoScrollEnabled()) {
			return;
		}

		if (Date.now() < ignoreScrollEventsUntil()) {
			return;
		}

		const index = nextIndexOrLast();
		if (index < 0) {
			return;
		}

		const container = e.currentTarget as HTMLDivElement;
		const button = findOptionElement(index, container);
		if (!button) {
			setIsAutoScrollEnabled(false);
			return;
		}

		const isVisible = isElementVisibleInContainer(button, container);

		if (!isVisible) {
			setIsAutoScrollEnabled(false);
		}
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

	// eslint-disable-next-line solid/reactivity
	const virtualizer = props.virtualize
		? createVirtualizer({
				getScrollElement: () => (containerRef()?.isConnected ? (containerRef() ?? null) : null),
				get count() {
					return props.entries.length;
				},
				estimateSize: (index) => props.estimateSize(index),
				useAnimationFrameWithResizeObserver: true,
			})
		: null;

	createEffect(() => {
		const _ = props.entries;
		untrack(() => {
			virtualizer?.measure();

			// TODO in solid 2 should be signal with reactive default value maybe
			setIsAutoScrollEnabled(true);
			scrollToIndexProgrammatically(nextIndexOrLast(), 'instant');
		});
	});

	onMount(() => {
		const timeoutId = setTimeout(() => {
			scrollToIndexProgrammatically(nextIndexOrLast(), 'instant');
		}, 100);
		onCleanup(() => clearTimeout(timeoutId));
	});

	function getChild(
		entry: () => T,
		index: () => number,
		virtualItem: VirtualItem | null,
		virtualizer: Virtualizer<HTMLDivElement, Element> | null,
	) {
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
					entryTime: () => props.getEntryTime(entry()),
					sceneName: () => props.getSceneName?.(entry()),
					state,
					isSelected: () => selectedIndex() === index(),
					index,
					virtualItem: () => virtualItem,
					virtualizer: virtualizer,
					parentId: id,
					setIsAutoScrollEnabled,
					setSelectedIndex,
				}}
			>
				<Show when={entry()}> {props.children(entry, state, previousEntry)}</Show>
			</TimelineListEntryContext.Provider>
		);
	}

	return (
		<>
			<div
				ref={setContainerRef}
				class="flex shrink grow basis-0 flex-col overflow-x-hidden overflow-y-auto"
				role="listbox"
				tabindex="0"
				aria-orientation="vertical"
				aria-activedescendant={selectedIndex() >= 0 ? getOptionId(selectedIndex()) : undefined}
				onScroll={handleScroll}
				onFocus={(e) => {
					const relatedTarget = e.relatedTarget as Node | null;
					const enteredFromOutside = !relatedTarget || !e.currentTarget.contains(relatedTarget);
					if (e.target === e.currentTarget && enteredFromOutside && selectedIndex() >= 0) {
						focusOption(selectedIndex());
					}
				}}
				onKeyDown={handleKeyDown}
			>
				<div
					class="relative w-full shrink-0"
					style={{
						// adding a little bit so resume button fits bellow last elements
						height: virtualizer ? `${virtualizer.getTotalSize() + 50}px` : undefined,
					}}
				>
					<Show
						when={virtualizer}
						fallback={
							<For each={props.entries}>
								{(entry, index) => {
									// eslint-disable-next-line solid/reactivity
									return getChild(() => entry, index, null, null);
								}}
							</For>
						}
					>
						{(virtualizer) => (
							<For each={virtualizer().getVirtualItems()}>
								{(virtualItem) => {
									const entry = () => props.entries[virtualItem.index];
									const index = () => virtualItem.index;
									return getChild(entry, index, virtualItem, virtualizer());
								}}
							</For>
						)}
					</Show>
				</div>
			</div>
			<Button
				class={cn(
					'absolute right-2 bottom-2 transition',
					!isAutoScrollEnabled() ? 'opacity-100' : 'pointer-events-none translate-y-40 opacity-0',
				)}
				variant="default"
				size="sm"
				onClick={resumeAutoScrollToCurrent}
				tabIndex={isAutoScrollEnabled() ? -1 : 0}
				aria-hidden={isAutoScrollEnabled()}
			>
				Follow timeline
			</Button>
		</>
	);
}

const TimelineListEntryContext = createContext<{
	entryTime: () => number;
	sceneName?: () => string | undefined;
	state: () => TimelineListEntryState;
	isSelected: () => boolean;
	index: () => number;
	virtualItem: () => VirtualItem | null;
	virtualizer: Virtualizer<HTMLDivElement, Element> | null;
	parentId: string;
	setIsAutoScrollEnabled: (enabled: boolean) => void;
	setSelectedIndex: (index: number) => void;
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
	heightMode: 'from-estimate' | 'auto';
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
		onClick: () => {
			context.setIsAutoScrollEnabled(true);
			context.setSelectedIndex(context.index());
		},
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

	function getStyle(): JSX.CSSProperties | undefined {
		const virtualItem = context.virtualItem();
		if (!virtualItem) return undefined;
		return {
			height: props.heightMode === 'from-estimate' ? `${virtualItem.size}px` : undefined,
			transform: `translateY(${virtualItem.start}px)`,
		};
	}

	return (
		<button
			{...hover}
			id={`timeline-list-${context.parentId}-option-${context.index()}`}
			data-index={context.index()}
			ref={context.virtualizer?.measureElement}
			role="option"
			tabindex={-1}
			aria-selected={context.isSelected()}
			class={cn(
				activeStateClasses(),
				'w-full border-b hover:bg-gray-200 dark:hover:bg-gray-700/50',
				context.virtualItem() ? 'absolute top-0 left-0' : 'relative',
				props.class,
			)}
			style={getStyle()}
		>
			{props.children}
		</button>
	);
}
