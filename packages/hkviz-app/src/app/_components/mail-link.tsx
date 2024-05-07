import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function MailLinkUnstyled({ className, mail = 'support@hkviz.org' }: { className?: string; mail?: string }) {
    return (
        <a className={className} href={`mailto:${mail}`}>
            {mail}
        </a>
    );
}

export function MailLink({ className, mail }: { className?: string; mail?: string }) {
    return <MailLinkUnstyled className={cn(buttonVariants({ variant: 'link' }), 'p-0', className)} mail={mail} />;
}
