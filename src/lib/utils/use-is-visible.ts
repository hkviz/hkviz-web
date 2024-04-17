import { useSignal, useSignalEffect, type ReadonlySignal } from '@preact/signals-react';

const OPTIONS = {
    root: null,
    rootMargin: '0px 0px 0px 0px',
    threshold: 0,
};

export function useIsVisibleSignal(elementRef: ReadonlySignal<SVGElement | HTMLElement | null>) {
    const isVisible = useSignal(false);

    useSignalEffect(() => {
        const element = elementRef.value;
        if (element) {
            const observer = new IntersectionObserver((entries, observer) => {
                isVisible.value = entries.some((entry) => entry.isIntersecting);
            }, OPTIONS);
            observer.observe(element);
            return () => observer.unobserve(element);
        } else {
            isVisible.value = false;
        }
    });

    return isVisible;
}
