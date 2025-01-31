import { type JSXElement, createSignal } from 'solid-js';
import { Expander } from '~/components/ui/additions';
import { Button } from '~/components/ui/button';

export function SpoilerWrapper(props: { children: JSXElement; title: string }) {
	const [isOpen, setIsOpen] = createSignal(false);

	return (
		<>
			<Expander expanded={!isOpen()}>
				<Button onClick={() => setIsOpen(true)}>{props.title}</Button>
			</Expander>
			<Expander expanded={isOpen()}>
				<div>{props.children}</div>
			</Expander>
		</>
	);
}
