import { Dynamic, renderToString as renderToStringSolid, render as solidRender } from 'solid-js/web';

export function render<T>(element: Element, component: any, props: T) {
    const DynamicAny = Dynamic as any;
    return solidRender(() => <DynamicAny component={component} {...props} />, element);
}

export function renderToString<T>(component: any, props: T) {
    const DynamicAny = Dynamic as any;
    return renderToStringSolid(() => <DynamicAny component={component} {...props} />);
}
