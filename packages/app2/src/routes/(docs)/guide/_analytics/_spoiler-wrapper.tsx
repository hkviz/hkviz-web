'use client';
import { Button, Expander } from '@hkviz/components';
import { type JSXElement, createSignal } from 'solid-js';

export function SpoilerWrapper(props: { children: JSXElement; title: string }) {
    const [isOpen, setIsOpen] = createSignal(false);

    return (
        <>
            <Expander expanded={!isOpen()}>
                <Button onClick={() => setIsOpen(true)}>{props.title}</Button>
            </Expander>
            <Expander expanded={isOpen()}>
                <div class="-mb-5 -mt-5">{props.children}</div>
            </Expander>
        </>
    );
}
