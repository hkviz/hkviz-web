import { JSXElement } from 'solid-js';
import { cn } from '~/lib/utils';

export const Setting = (props: { children: JSXElement; class?: string }) => {
	return (
		<div
			class={cn(
				'-m-3 flex flex-col justify-between gap-4 rounded-md p-3 sm:flex-row sm:items-center',
				props.class,
			)}
		>
			{props.children}
		</div>
	);
};

export const SettingContent = (props: { children: JSXElement; class?: string }) => {
	return <div class={props.class}>{props.children}</div>;
};

export const SettingTitle = (props: { children: JSXElement; class?: string }) => {
	return <h3 class={cn('text-lg font-semibold', props.class)}>{props.children}</h3>;
};

export const SettingDescription = (props: { children: JSXElement; class?: string }) => {
	return <p class={cn('text-sm text-gray-500', props.class)}>{props.children}</p>;
};
