import { ExternalLink } from 'lucide-solid';
import { type JSXElement } from 'solid-js';

export function ExternalLinkMdx(props: { href: string; children: JSXElement }) {
    return (
        <a href={props.href} target="_blank" rel="noopener noreferrer" class="group">
            <ExternalLink class="mr-1 inline-block h-3 w-3 opacity-60 group-hover:opacity-100" />
            {props.children}
        </a>
    );
}
