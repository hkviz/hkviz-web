import { type Component } from 'solid-js';
import { Dynamic, render as solidRender, renderToString as renderToStringSolid } from 'solid-js/web';

export function render<T>(element: Element, component: Component<T>, props: T) {
    const DynamicAny = Dynamic as any;
    return solidRender(() => <DynamicAny component={component} {...props} />, element);
}

export function renderToString<T>(component: Component<T>, props: T) {
    const DynamicAny = Dynamic as any;
    return renderToStringSolid(() => <DynamicAny component={component} {...props} />);
}
