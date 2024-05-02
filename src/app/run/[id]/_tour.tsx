import { Button } from '@/components/ui/button';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { useComputed, useSignalEffect, useSignals } from '@preact/signals-react/runtime';
import { PopoverAnchor, PopoverArrow } from '@radix-ui/react-popover';
import { X } from 'lucide-react';
import { useRef } from 'react';
import { gameplayStore } from '~/lib/stores/gameplay-store';
import { type Step } from '~/lib/stores/tour/step';
import { tourStore } from '~/lib/stores/tour/tour-store';
import { useSignalRef } from '~/lib/utils/signal-ref';

// const steps: Step[] = [
//     {
//         target: '.run-overview-content',
//         content: (
//             <>
//                 Welcome to <HKVizText />! This quick start tour will show you the most important stuff.
//             </>
//         ),
//         disableBeacon: true,
//     },
//     {
//         target: '.run-overview-content',
//         content: 'This another awesome feature!',
//     },
// ];

// function TourStepEffectRunner({ step }: { step: Step }) {
//     useSignalEffect(() => {
//         step.activeEffect?.();
//     });

//     return undefined;
// }

interface TourStepProps {
    step: Step;
    index: number;
}

function TourStep({ step, index }: TourStepProps) {
    useSignals();
    const isActive = useComputed(() => tourStore.currentStep.value === step);
    const target = typeof step.target === 'string' ? step.target : step.target.value;
    const popoverSide = typeof step.popoverSide === 'string' ? step.popoverSide : step.popoverSide?.value;
    const ref = useRef<HTMLElement | null>(null);
    ref.current =
        document.querySelector<HTMLElement>(target) ??
        (step.targetFallback != null ? document.querySelector<HTMLElement>(step.targetFallback) : null);
    const Content = step.content;

    console.log({ target, step });

    return (
        <>
            <Popover open={isActive.value}>
                <PopoverAnchor virtualRef={ref} />
                <PopoverContent
                    side={popoverSide}
                    updatePositionStrategy="always"
                    sideOffset={step.padding ?? 8}
                    className={
                        step.widthByTrigger === true
                            ? 'w-[min(calc(var(--radix-popover-trigger-width)+2rem),calc(100vw-2rem),70ch)]'
                            : undefined
                    }
                >
                    <Button
                        className="float-right mb-2 ml-2 h-8 w-8 rounded-full"
                        size="icon"
                        variant="outline"
                        onClick={tourStore.close}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    <Content />
                    <div className="flex flex-row items-end gap-2 ">
                        <span className="grow text-xs opacity-60">
                            {index + 1} / {tourStore.steps.length}
                        </span>
                        {step.hidePrevious !== true && (
                            <Button onClick={tourStore.back} variant="outline">
                                Back
                            </Button>
                        )}
                        <Button onClick={tourStore.next}>
                            {index === tourStore.steps.length - 1 ? 'Finish' : 'Next'}
                        </Button>
                    </div>
                    <PopoverArrow width={15} height={8} className="fill-popover stroke-current stroke-2 text-border" />
                </PopoverContent>
            </Popover>
            {/* {isActive.value && <TourStepEffectRunner step={step} />} */}
        </>
    );
}

function TourShadow() {
    useSignals();

    const shadowRef = useSignalRef<HTMLDivElement>();
    const shadowInnerRef = useSignalRef<HTMLDivElement>();

    useSignalEffect(() => {
        const _shadow = shadowRef.signal.value;
        const _shadowInner = shadowInnerRef.signal.value;
        if (!_shadow || !_shadowInner) {
            return;
        }
        const currentStep = tourStore.currentStep.value;
        const padding = currentStep?.padding ?? 8;
        const targetQuery =
            currentStep != null
                ? typeof currentStep.target === 'string'
                    ? currentStep.target
                    : currentStep.target.value
                : undefined;
        const target = targetQuery != null ? document.querySelector<HTMLElement>(targetQuery) : undefined;
        const fadeout = currentStep?.fadeoutShadow?.value ?? false;
        _shadowInner.style.opacity = fadeout ? '0' : '1';

        if (!target) {
            _shadow.style.top = '0';
            _shadow.style.left = '0';
            _shadow.style.width = '100%';
            _shadow.style.height = '100%';
        } else {
            let stopped = false;
            let previousSize: DOMRect | null = null;

            function resize() {
                if (stopped) return;
                if (!target) return;
                if (!_shadow) return;
                const rect = target.getBoundingClientRect();
                if (
                    previousSize?.width !== rect.width ||
                    previousSize?.height !== rect.height ||
                    previousSize?.top !== rect.top ||
                    previousSize?.left !== rect.left
                ) {
                    _shadow.style.top = `${rect.top - padding}px`;
                    _shadow.style.left = `${rect.left - padding}px`;
                    _shadow.style.width = `${rect.width + 2 * padding}px`;
                    _shadow.style.height = `${rect.height + 2 * padding}px`;
                    previousSize = rect;
                }

                requestAnimationFrame(resize);
            }

            resize();

            return () => {
                stopped = true;
            };
        }
    });

    return (
        <div
            className={
                'pointer-events-none fixed left-0 top-0 z-20 h-full w-full rounded-md border-2 border-black dark:border-white'
            }
            ref={shadowRef.ref}
        >
            <div
                className={'absolute inset-0 h-full w-full rounded-md shadow-[0_0_0_100vmax_rgba(0,0,0,0.3)]'}
                ref={shadowInnerRef.ref}
            />
            <div className="animate-pulse-shadow-black dark:animate-pulse-shadow-white absolute inset-0 h-full w-full rounded-md" />
            {/* <div className="animate-pulse-shadow-black dark:animate-pulse-shadow-white inset-0 h-full w-full rounded-md text-foreground opacity-50" /> */}
        </div>
    );
}

export function SingleRunPageTour() {
    useSignals();
    const recording = gameplayStore.recording.value;
    const isOpen = tourStore.isOpen.value;

    if (!recording || !isOpen) {
        return null;
    }

    return (
        <>
            {tourStore.steps.map((step, index) => (
                <TourStep key={index} step={step} index={index} />
            ))}
            <TourShadow />
        </>
    );
}
