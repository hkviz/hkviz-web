import { type Accessor, createEffect, createSignal } from 'solid-js';

const OPTIONS = {
    root: null,
    rootMargin: '0px 0px 0px 0px',
    threshold: 0,
};

export function createIsVisible(elementRef: Accessor<Element | null>) {
    const [isVisible, setIsVisible] = createSignal(false);

    createEffect(function isVisibleEffect() {
        const element = elementRef();
        if (element) {
            const observer = new IntersectionObserver((entries, _observer) => {
                setIsVisible(entries.some((entry) => entry.isIntersecting));
            }, OPTIONS);
            observer.observe(element);
            return () => observer.unobserve(element);
        } else {
            setIsVisible(false);
        }
    });

    return isVisible;
}
