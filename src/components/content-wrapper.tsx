import { type Component, type JSXElement } from 'solid-js';
import { cn } from '~/lib/utils';

export type ContentWrapperProps = {
	children?: JSXElement;
	class?: string;
	backgroundClass?: string;
	footerOutOfSight?: boolean;
};

export const ContentWrapper: Component<ContentWrapperProps> = (props) => {
	// t3 template: from-[#2e026d] to-[#15162c]
	// similar to hk initial menu style: from-[#233458] to-[#010103]
	// similar to lifeblood menu style: from-[#4585bc] to-[#06111d]
	return (
		<div
			data-content-wrapper
			class={cn(
				'relative -mt-40 flex grow flex-col pt-40',
				props.footerOutOfSight
					? 'min-h-[calc(100vh+var(--spacing,0.25rem)*40-var(--main-nav-height))]'
					: 'min-h-[calc(100vh+var(--spacing,0.25rem)*40-var(--main-nav-height)-var(--footer-height))]',
			)}
		>
			<div class={cn('absolute inset-0 -z-10 bg-background opacity-0', props.backgroundClass)} />
			<main
				class={cn(
					'flex grow flex-col text-black dark:text-white',
					props.footerOutOfSight ? 'min-h-[100vh-(var(--main-nav-height))]' : '',
					props.class,
				)}
			>
				{props.children}
			</main>
		</div>
	);
};

export const ContentCenterWrapper: Component<ContentWrapperProps> = (props) => {
	return <ContentWrapper class="items-center justify-center p-4" {...props} />;
};
