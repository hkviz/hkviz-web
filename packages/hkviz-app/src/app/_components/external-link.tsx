import { ExternalLink } from 'lucide-react';

export function ExternalLinkMdx({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="group">
            <ExternalLink className="mr-1 inline-block h-3 w-3 opacity-60 group-hover:opacity-100" />
            {children}
        </a>
    );
}
