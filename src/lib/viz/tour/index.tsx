import { X } from 'lucide-solid';
import { For, Show, createEffect, createMemo, onCleanup, untrack, type Component } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { Button } from '~/components/ui/button';
import { Popover, PopoverContent } from '~/components/ui/popover';
import { gameplayStore, useTourStore } from '../store';
import { type Step } from './step';

interface TourStepProps {
	step: Step;
	index: number;
}

const TourStep: Component<TourStepProps> = (props) => {
	const tourStore = useTourStore();

	const isActive = createMemo(() => tourStore.currentStepIndex() === props.index);
	const target = () => props.step.target();
	const popoverSide = () => props.step.popoverSide?.();
	const targetOrFallback = () =>
		document.querySelector<HTMLElement>(target()) ??
		(props.step.targetFallback != null
			? (document.querySelector<HTMLElement>(props.step.targetFallback) ?? undefined)
			: undefined);

	return (
		<>
			<Popover
				open={isActive()}
				gutter={props.step.padding ?? 8}
				anchorRef={targetOrFallback}
				placement={popoverSide()}
			>
				<PopoverContent
					class={
						props.step.widthByTrigger === true
							? 'w-[min(calc(var(--kb-popper-anchor-width,0)+2rem),calc(100vw-2rem),70ch)]'
							: undefined
					}
				>
					<Button
						class="float-right mb-2 ml-2 h-8 w-8 rounded-full"
						size="icon"
						variant="outline"
						onClick={tourStore.close}
					>
						<X class="h-4 w-4" />
					</Button>
					<Dynamic component={props.step.content} />
					<div class="flex flex-row items-end gap-2">
						<span class="grow text-xs opacity-60">
							{props.index + 1} / {tourStore.tourLength}
						</span>
						{props.step.hidePrevious !== true && (
							<Button onClick={tourStore.back} variant="outline">
								Back
							</Button>
						)}
						<Button onClick={tourStore.next}>
							{props.index === tourStore.tourLength - 1 ? 'Finish' : 'Next'}
						</Button>
					</div>
					{/* TODO arrow: */}
					{/* <PopoverArrow size={15} class="fill-popover stroke-current stroke-2 text-border" /> */}
				</PopoverContent>
			</Popover>
			{/* {isActive() && <TourStepEffectRunner step={step} />} */}
		</>
	);
};

const TourShadow: Component = () => {
	const tourStore = useTourStore();

	const shadowInner = (
		<div class={'absolute inset-0 h-full w-full rounded-md shadow-[0_0_0_100vmax_rgba(0,0,0,0.3)]'} />
	) as HTMLDivElement;
	const shadow = (
		<div
			class={
				'pointer-events-none fixed left-0 top-0 z-20 h-full w-full rounded-md border-2 border-black dark:border-white'
			}
		>
			{shadowInner}
			<div class="absolute inset-0 h-full w-full animate-pulse-shadow-black rounded-md dark:animate-pulse-shadow-white" />
			{/* <div class="animate-pulse-shadow-black dark:animate-pulse-shadow-white inset-0 h-full w-full rounded-md text-foreground opacity-50" /> */}
		</div>
	) as HTMLDivElement;
	let previousTarget: HTMLElement | null = null;

	const currentStep = () => tourStore.steps[tourStore.currentStepIndex()];

	createEffect(() => {
		const _currentStep = currentStep();
		const padding = _currentStep?.padding ?? 8;
		console.log('padding', padding);
		const targetQuery = _currentStep?.target();
		const target = targetQuery != null ? document.querySelector<HTMLElement>(targetQuery) : null;

		if (previousTarget !== target) {
			previousTarget = target;
			if (target) {
				target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
			}
		}

		const fadeout = currentStep()?.fadeoutShadow?.() ?? false;
		shadowInner.style.opacity = fadeout ? '0' : '1';

		if (!target) {
			shadow.style.top = '0';
			shadow.style.left = '0';
			shadow.style.width = '100%';
			shadow.style.height = '100%';
		} else {
			let stopped = false;
			let previousSize: DOMRect | null = null;

			function resize() {
				if (stopped) return;
				if (!target) return;
				if (!shadow) return;
				const rect = target.getBoundingClientRect();
				if (
					previousSize?.width !== rect.width ||
					previousSize?.height !== rect.height ||
					previousSize?.top !== rect.top ||
					previousSize?.left !== rect.left
				) {
					shadow.style.top = `${rect.top - padding}px`;
					shadow.style.left = `${rect.left - padding}px`;
					shadow.style.width = `${rect.width + 2 * padding}px`;
					shadow.style.height = `${rect.height + 2 * padding}px`;
					previousSize = rect;
				}

				requestAnimationFrame(resize);
			}

			resize();

			onCleanup(() => {
				stopped = true;
			});
		}
	});

	return shadow;
};

export const SingleRunPageTour: Component = () => {
	const tourStore = useTourStore();
	const recording = gameplayStore.recording;
	const isOpen = tourStore.isOpen;

	const currentStep = createMemo(() => tourStore.steps[tourStore.currentStepIndex()]);

	createEffect(() => {
		const step = currentStep();
		if (step) {
			untrack(() => {
				step.onActivate?.();
			});
			createEffect(() => {
				step.activeEffect?.();
			});
		}
	});

	return (
		<Show when={recording() && isOpen()}>
			<For each={tourStore.steps}>{(step, index) => <TourStep step={step} index={index()} />}</For>
			<TourShadow />
		</Show>
	);
};
