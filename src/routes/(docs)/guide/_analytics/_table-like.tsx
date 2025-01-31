import { type JSXElement } from 'solid-js';

export function ReflowRow(props: { children: JSXElement }) {
    return <div class="flex flex-col md:flex-row">{props.children}</div>;
}

export function ReflowCell(props: { children: JSXElement }) {
    return (
        <div class="bottom-t grow border-black border-opacity-10 p-4 first:border-0 md:basis-0 md:border-l md:border-t-0 md:first:border-0 dark:border-white dark:border-opacity-10">
            {props.children}
        </div>
    );
}

export function ReflowCellHeader(props: { children: JSXElement }) {
    return <b class="block font-serif">{props.children}</b>;
}
