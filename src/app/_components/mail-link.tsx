import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function MailLinkUnstyled(props: { className?: string }) {
    return (
        <a className={props.className} href="mailto:hkviz@olii.dev">
            hkviz@olii.dev
        </a>
    );
}

export function MailLink() {
    return <MailLinkUnstyled className={cn(buttonVariants({ variant: 'link' }), 'p-0')} />;
}
