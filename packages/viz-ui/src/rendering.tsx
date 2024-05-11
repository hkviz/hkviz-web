import { type Component } from 'solid-js';
import { Dynamic, render as solidRender } from 'solid-js/web';

export function render<T>(element: Element, component: Component<T>, props: T) {
    return solidRender(() => <Dynamic component={component} {...props} />, element);
}
