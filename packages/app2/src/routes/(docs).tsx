import { type JSXElement } from 'solid-js';
export default function DocsLayout(props: { children: JSXElement }) {
    return (
        <div>
            <h1>Docs Layout</h1>
            <input type="text" />
            {props.children}
        </div>
    );
}
