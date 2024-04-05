import { type HTMLSVGElement } from 'country-flag-icons/react/3x2';
import { useEffect, useRef, type RefObject } from 'react';

const OPTIONS = {
    root: null,
    rootMargin: '0px 0px 0px 0px',
    threshold: 0,
};

function useIsVisibleRef(elementRef: RefObject<HTMLSVGElement> | RefObject<HTMLElement> | RefObject<HTMLDivElement> | RefObject<SVGSVGElement>) {
    const isVisible = useRef(false);

    useEffect(() => {
        const element = elementRef.current;
        if (element) {
            const observer = new IntersectionObserver((entries, observer) => {
                isVisible.current = entries.some((entry) => entry.isIntersecting);
            }, OPTIONS);
            observer.observe(element);
            return () => observer.unobserve(element);
        }
    }, [elementRef]);

    return isVisible;
}

export default useIsVisibleRef;
