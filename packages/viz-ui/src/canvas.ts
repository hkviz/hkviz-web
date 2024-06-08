import { viewportStore } from '@hkviz/viz';
import { type Accessor, createEffect, createSignal, onCleanup, createMemo } from 'solid-js';

export function createElementSize<T extends HTMLElement>(
    element: Accessor<T | null>,
): Accessor<{ width: number; height: number }> {
    const [size, setSize] = createSignal({ width: element()?.offsetWidth ?? 0, height: element()?.offsetHeight ?? 0 });

    createEffect(function elementSizeEffect() {
        const _element = element();
        if (!_element) return;

        function handleResize() {
            setSize({ width: element()?.offsetWidth ?? 0, height: element()?.offsetHeight ?? 0 });
        }

        const resizeObserver = new ResizeObserver(handleResize);
        handleResize();

        resizeObserver.observe(_element);

        onCleanup(() => {
            resizeObserver.disconnect();
        });
    });
    return size;
}

export function createAutoSizeCanvas(
    container: Accessor<HTMLElement | null>,
    canvas: Accessor<HTMLCanvasElement | null>,
    repaintOnZoom = true,
) {
    const containerSize = createElementSize(container);

    const canvasSize = createMemo(function autoSizeCanvasResizingComputed() {
        const _canvas = canvas();
        const _containerSize = containerSize();

        if (!_canvas || !_containerSize) return { widthInUnits: 0, heightInUnits: 0, pixelRatio: 1, canvas: null };

        const zoomLevel = repaintOnZoom ? viewportStore.visualViewportScale() : 1;

        const ratio = window.devicePixelRatio * zoomLevel;

        _canvas.width = _containerSize.width * ratio;
        _canvas.height = _containerSize.height * ratio;
        const ctx = _canvas.getContext('2d')!;
        ctx.scale(ratio, ratio);

        return {
            canvas: _canvas,
            widthInUnits: _containerSize.width,
            heightInUnits: _containerSize.height,
            pixelRatio: window.devicePixelRatio,
        };
    });
    return canvasSize;
}
