import { cn } from '~/lib/utils';
import { buttonVariants } from './ui/button';

export function MailLinkUnstyled(props: { class?: string; mail?: string }) {
	const mail = () => props.mail ?? 'support@hkviz.org';
	return (
		<a class={props.class} href={`mailto:${mail()}`}>
			{mail()}
		</a>
	);
}

export function MailLink(props: { class?: string; mail?: string }) {
	return <MailLinkUnstyled class={cn(buttonVariants({ variant: 'link' }), 'p-0', props.class)} mail={props.mail} />;
}
