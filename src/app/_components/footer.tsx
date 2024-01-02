import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Footer() {
    return (
        <footer className="flex h-[var(--footer-height)] w-full flex-row items-center justify-center bg-background">
            <Button asChild variant="link" className="text-foreground opacity-80">
                <Link href="/getting-started">Getting started</Link>
            </Button>
            <Button asChild variant="link" className="text-foreground opacity-80">
                <Link href="/credits">Credits</Link>
            </Button>
            <Button asChild variant="link" className="text-foreground opacity-80">
                <Link href="/privacy-policy">Privacy policy</Link>
            </Button>
        </footer>
    );
}
