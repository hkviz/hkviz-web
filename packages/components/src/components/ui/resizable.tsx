import { Show, splitProps, type Component } from 'solid-js';

import { Resizable as ResizablePrimitive, type HandleProps, type RootProps } from 'corvu/resizable';

import { cn } from '../../lib';

const Resizable: Component<RootProps> = (props) => {
    const [, rest] = splitProps(props, ['class']);
    return (
        <ResizablePrimitive class={cn('flex size-full data-[orientation=vertical]:flex-col', props.class)} {...rest} />
    );
};

const ResizablePanel = ResizablePrimitive.Panel;

const ResizableHandle: Component<HandleProps & { withHandle?: boolean }> = (props) => {
    const [, rest] = splitProps(props, ['class', 'withHandle']);
    return (
        <ResizablePrimitive.Handle
            class={cn(
                'bg-border focus-visible:ring-ring relative flex w-px shrink-0 items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 data-[orientation=vertical]:h-px data-[orientation=vertical]:w-full data-[orientation=vertical]:after:left-0 data-[orientation=vertical]:after:h-1 data-[orientation=vertical]:after:w-full data-[orientation=vertical]:after:-translate-y-1/2 data-[orientation=vertical]:after:translate-x-0 [&[data-orientation=vertical]>div]:rotate-90',
                props.class,
            )}
            {...rest}
        >
            <Show when={props.withHandle}>
                <div class="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-sm border">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="size-2.5"
                    >
                        <path d="M9 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                        <path d="M9 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                        <path d="M9 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                        <path d="M15 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                        <path d="M15 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                        <path d="M15 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                    </svg>
                </div>
            </Show>
        </ResizablePrimitive.Handle>
    );
};

export { Resizable, ResizableHandle, ResizablePanel };
