import { type Component } from 'solid-js';
import { Dynamic, render as solidRender, renderToString as renderToStringSolid } from 'solid-js/web';

export function render<T>(element: Element, component: Component<T>, props: T) {
    return solidRender(() => <Dynamic component={component} {...props} />, element);
}

export function renderToString<T>(component: Component<T>, props: T) {
    return renderToStringSolid(() => <Dynamic component={component} {...props} />);
}
