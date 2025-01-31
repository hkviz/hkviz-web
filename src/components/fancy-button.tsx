import { createSignal, onMount, splitProps, ValidComponent } from 'solid-js';
import { Button, ButtonProps } from './ui/button';
import { PolymorphicProps } from '@kobalte/core';
import { cn } from '~/lib/utils';

export interface FancyButtonProps<T extends ValidComponent = 'button'> extends ButtonProps<T> {
	idk?: true; // TODO
}

export const FancyButton = <T extends ValidComponent = 'button'>(props: PolymorphicProps<T, FancyButtonProps<T>>) => {
	const [local, others] = splitProps(props, ['idk', 'class', 'children']);
	const ButtonT = Button<T>;

	const [loading, setLoading] = createSignal(true);

	onMount(() => {
		setLoading(false);
	});

	return (
		<ButtonT
			class={cn(
				'fancy-button h-auto bg-primary/50 px-8 py-4 font-serif text-2xl font-semibold hover:bg-primary/80',
				loading() ? 'fancy-button-loading' : '',
				local.class,
			)}
			{...(others as any)}
		>
			<div class="fancy-button-shadow" />
			{local.children}
		</ButtonT>
	);
};
