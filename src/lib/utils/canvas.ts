import { useComputed, useSignal, useSignalEffect, type ReadonlySignal } from '@preact/signals-react';
import { zoomStore } from '../stores/zoom-store';

export function useElementSize<T extends HTMLElement>(element: ReadonlySignal<T | null>) {
    const size = useSignal({ width: element.value?.offsetWidth ?? 0, height: element.value?.offsetHeight ?? 0 });
    useSignalEffect(() => {
        const _element = element.value;
        if (!_element) return;

        const resizeObserver = new ResizeObserver(() => {
            size.value = { width: element.value?.offsetWidth ?? 0, height: element.value?.offsetHeight ?? 0 };
        });

        resizeObserver.observe(_element);

        return () => {
            resizeObserver.disconnect();
        };
    });
    return size;
}

export function useAutoSizeCanvas(
    container: ReadonlySignal<HTMLElement | null>,
    canvas: ReadonlySignal<HTMLCanvasElement | null>,
    repaintOnZoom = true,
) {
    const containerSize = useElementSize(container);

    return useComputed(() => {
        const _canvas = canvas.value;
        const _containerSize = containerSize.value;

        if (!_canvas || !_containerSize) return { widthInUnits: 0, heightInUnits: 0, pixelRatio: 1, canvas: null };

        const zoomLevel = repaintOnZoom ? zoomStore.visualViewportScale.value : 1;

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
}
