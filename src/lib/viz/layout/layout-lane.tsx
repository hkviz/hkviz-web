import { Maximize, Minus, Rows } from 'lucide-solid';
import { For, onCleanup, onMount, Show, type Component } from 'solid-js';
import { Button } from '~/components/ui/button';
import { Resizable, ResizableHandle } from '~/components/ui/resizable';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { cn } from '~/lib/utils';
import { LaneId } from '../layout/layout-location';
import { LayoutPanel } from '../layout/layout-panel';
import { useLayoutStore } from '../store/layout-store';

interface ResizeButtonsProps {
	state: 'minimized' | 'medimized' | 'maximized';
	minimize: () => void;
	medimize: () => void;
	maximize: () => void;
}
const ResizeButtons: Component<ResizeButtonsProps> = (props) => {
	return (
		<div class="-ml-3 inline-block shrink-0 pl-1">
			<Show when={props.state !== 'minimized'}>
				<Tooltip>
					<TooltipTrigger
						as={() => (
							<Button variant="ghost" size="icon" class="h-7 w-7" onClick={props.minimize}>
								<Minus class="h-3 w-3" />
							</Button>
						)}
					/>
					<TooltipContent>Close</TooltipContent>
				</Tooltip>
			</Show>
			<Show when={props.state !== 'medimized'}>
				<Tooltip>
					<TooltipTrigger
						as={() => (
							<Button variant="ghost" size="icon" class="h-7 w-7" onClick={props.medimize}>
								<Rows class="h-3 w-3" />
							</Button>
						)}
					/>
					<TooltipContent>Show splits & time-based charts</TooltipContent>
				</Tooltip>
			</Show>
			<Show when={props.state !== 'maximized'}>
				<Tooltip>
					<TooltipTrigger
						as={() => (
							<Button variant="ghost" size="icon" class="h-7 w-7" onClick={props.maximize}>
								<Maximize class="h-3 w-3" />
							</Button>
						)}
					/>
					<TooltipContent>Maximize</TooltipContent>
				</Tooltip>
			</Show>
		</div>
	);
};

export const LayoutLane: Component<{ class?: string; lane: LaneId }> = (props) => {
	const layoutStore = useLayoutStore();
	let laneRef: HTMLDivElement | undefined;

	const lanePanels = () => layoutStore.getLaneLocationIds(props.lane);
	const sizes = () => layoutStore.getLanePanelSizes(props.lane);
	const setSizes = (newSizes: number[]) => layoutStore.setLanePanelSizes(props.lane, newSizes);

	onMount(() => {
		if (!laneRef) {
			return;
		}

		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (!entry) {
				return;
			}
			layoutStore.setLaneContainerSizePx(props.lane, entry.contentRect.height);
		});

		layoutStore.setLaneContainerSizePx(props.lane, laneRef.getBoundingClientRect().height);
		observer.observe(laneRef);

		onCleanup(() => observer.disconnect());
	});

	function resizeOptions(index: number) {
		return (
			<ResizeButtons
				state={
					layoutStore.isCollapsed(props.lane, index)
						? 'minimized'
						: layoutStore.isMaximized(props.lane, index)
							? 'maximized'
							: 'medimized'
				}
				minimize={() => layoutStore.minimizePanel(props.lane, index)}
				medimize={() => layoutStore.medimizePanel(props.lane, index)}
				maximize={() => layoutStore.maximizePanel(props.lane, index)}
			/>
		);
	}

	return (
		<div ref={laneRef} class={cn('shrink grow', props.class)}>
			<Resizable orientation="vertical" sizes={sizes()} onSizesChange={setSizes}>
				<For each={lanePanels()}>
					{(_panel, index) => (
						<>
							<Show when={index() !== 0}>
								<ResizableHandle withHandle class="bg-transparent p-1" />
							</Show>
							<LayoutPanel
								layoutLane={props.lane}
								layoutLaneIndex={index()}
								resizeOptions={resizeOptions(index())}
							/>
						</>
					)}
				</For>
			</Resizable>
		</div>
	);
};
