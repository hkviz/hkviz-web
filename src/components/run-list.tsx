import { Key } from '@solid-primitives/keyed';
import { createAsync } from '@solidjs/router';
import { createEffect, createMemo, createSignal, createUniqueId, For, onCleanup, Show, Suspense } from 'solid-js';
import { createMutableMemo } from '~/lib/create-mutable-memo';
import { RunMetadata } from '~/server/run/_find_runs_internal';
import { DEFAULT_PAGE_SIZE, filterParamsAtPage, RunFilterBaseNoPage } from '~/server/run/find_runs_base';
import { RunCard } from './run-card/run-card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Skeleton } from './ui/skeleton';

interface RunListChunkProps<TFilter extends RunFilterBaseNoPage> {
	filter: TFilter;
	loadPage(): Promise<RunMetadata[]>;
	isOwnRun?: (run: RunMetadata) => boolean;
	onCombineClicked?: (run: RunMetadata) => void;

	showUser?: boolean;
	selectionMode?: boolean;
	isSelected?(runId: string): boolean;
	setSelected?(runId: string, selected: boolean): void;
	disableSelection?: (run: RunMetadata) => boolean;
}
function RunListChunk(props: RunListChunkProps<RunFilterBaseNoPage>) {
	const id = createUniqueId();
	const runs = createAsync(() => props.loadPage());

	const onRunClick = (run: RunMetadata) => {
		if (props.disableSelection?.(run)) {
			return;
		}
		props.setSelected?.(run.id, !props.isSelected?.(run.id));
	};

	const onRunClickIfInSelectionMode = () => (props.selectionMode ? onRunClick : undefined);

	return (
		<Suspense
			fallback={
				<>
					<For each={[1, 2, 3, 4, 5]}>
						{(index) => {
							const checkboxId = `run-checkbox-skeleton-${id}-${index}`;
							return (
								<li class="flex flex-row items-center gap-3">
									<Show when={props.selectionMode}>
										<Checkbox id={checkboxId} checked={false} disabled={true} />
									</Show>
									<Skeleton class="mb-2 h-34! w-full! rounded-3xl bg-card" />
								</li>
							);
						}}
					</For>
				</>
			}
		>
			<Key each={runs()} by={(it) => it.id}>
				{(run) => {
					const checkboxId = `run-checkbox-${id}-${run().id}`;
					return (
						<li class="flex flex-row items-center gap-3">
							<Show when={props.selectionMode}>
								<Checkbox
									id={checkboxId}
									checked={props.isSelected ? props.isSelected(run().id) : false}
									disabled={props.disableSelection?.(run())}
									onChange={(checked) => props.setSelected?.(run().id, checked as boolean)}
								/>
							</Show>
							<div class="grow">
								<RunCard
									run={run()}
									showUser={props.showUser}
									onClick={onRunClickIfInSelectionMode()}
									isOwnRun={props.isOwnRun?.(run()) ?? false}
									onCombineClicked={props.onCombineClicked}
									gray={props.selectionMode && props.disableSelection?.(run())}
									isSelected={props.selectionMode && props.isSelected?.(run().id)}
								/>
							</div>
						</li>
					);
				}}
			</Key>
		</Suspense>
	);
}

export interface RunListProps<TFilter extends RunFilterBaseNoPage> {
	filter: TFilter;
	loadPage(filter: TFilter): Promise<RunMetadata[]>;
	showUser?: boolean;
	isOwnRun?: (run: RunMetadata) => boolean;
	onCombineClicked?: (run: RunMetadata) => void;

	selectionMode?: boolean;
	selection?: string[];
	selectionChanged?: (runIds: string[]) => void;
	disableSelection?: (run: RunMetadata) => boolean;
}

export function RunList(props: RunListProps<RunFilterBaseNoPage>) {
	const [loadMoreRef, setLoadMoreRef] = createSignal<HTMLDivElement | undefined>(undefined);
	const [pages, setPages] = createMutableMemo(() => {
		const _filter = props.filter;
		return 1;
	});
	const pageIndexes = createMemo(() => {
		const count = pages();
		return Array.from({ length: count }, (_, i) => i);
	});

	function loadPage(page: number) {
		const filter = props.filter;
		return props.loadPage(filterParamsAtPage(filter, page));
	}
	const firstPage = createAsync(() => loadPage(0));
	const lastPage = createAsync(async () => {
		const index = pages() - 1;
		return {
			content: await loadPage(index),
			index,
		};
	});

	const canLoadMore = () => {
		const last = lastPage();
		return last != null && last.content.length === DEFAULT_PAGE_SIZE && last.index === pages() - 1;
	};

	function loadNextPage() {
		if (!canLoadMore()) {
			return;
		}
		setPages(pages() + 1);
	}

	createEffect(() => {
		let disconnected = false;
		const loadMoreEl = loadMoreRef();
		if (!loadMoreEl) {
			return;
		}
		function handleIntersect(entries: IntersectionObserverEntry[]) {
			const visible = entries.some((entry) => entry.isIntersecting);
			if (visible) {
				loadNextPage();
			}
		}

		const observer = new IntersectionObserver(handleIntersect, {
			rootMargin: '1px',
		});
		observer.observe(loadMoreEl);
		queueMicrotask(() => {
			if (disconnected) {
				return;
			}
			const entries = observer.takeRecords();
			handleIntersect(entries);
		});
		onCleanup(() => {
			disconnected = true;
			observer.disconnect();
		});
	});

	const showNoRunsFound = createMemo(() => {
		const first = firstPage();
		if (first == null) {
			return false;
		}
		return first.length === 0;
	});

	function isSelected(runId: string) {
		return props.selection?.includes(runId) ?? false;
	}
	function setSelected(runId: string, selected: boolean) {
		if (!props.selectionChanged) {
			return;
		}
		if (selected) {
			props.selectionChanged([...(props.selection ?? []), runId]);
		} else {
			props.selectionChanged((props.selection ?? []).filter((id) => id !== runId));
		}
	}

	return (
		<Show when={!showNoRunsFound()} fallback={<p class="text-center">No gameplays found</p>}>
			<ul class="flex flex-col">
				<For each={pageIndexes()}>
					{(page) => (
						<RunListChunk
							filter={props.filter}
							loadPage={() => loadPage(page)}
							showUser={props.showUser}
							isOwnRun={props.isOwnRun}
							onCombineClicked={props.onCombineClicked}
							selectionMode={props.selectionMode}
							setSelected={setSelected}
							isSelected={isSelected}
							disableSelection={props.disableSelection}
						/>
					)}
				</For>
				<div ref={setLoadMoreRef} />
				<Suspense>
					<Show when={canLoadMore()}>
						<Button variant="outline" onClick={loadNextPage} class="mx-auto mt-4 border-white/5 bg-card/30">
							Load more
						</Button>
					</Show>
				</Suspense>
			</ul>
		</Show>
	);
}
