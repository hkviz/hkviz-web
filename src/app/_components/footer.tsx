import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DiscordDialogButton, GithubButton, MailButton } from './socials-links';
import { HKVizText } from './hkviz-text';

export function Footer() {
    return (
        <footer className="flex min-h-[var(--footer-height)] w-full flex-col items-center justify-center bg-background">
            <div className="grid w-full max-w-[900px] grid-cols-1 p-4 sm:grid-cols-[1fr_2fr_1fr]">
                <div className="text-balance text-center text-sm text-foreground opacity-80 sm:text-left">
                    <HKVizText /> is not affiliated with Team Cherry. Hollow Knight and all related indicia are
                    trademarks of{' '}
                    <a className="hover:underline" href="https://teamcherry.com.au" target="_blank" rel="noreferrer">
                        Team Cherry
                    </a>{' '}
                    © 2017
                </div>
                <div className="flex w-full flex-row flex-wrap items-center justify-center">
                    <Button asChild variant="link" className="text-foreground opacity-80">
                        <Link href="/getting-started">Getting started</Link>
                    </Button>
                    <Button asChild variant="link" className="text-foreground opacity-80">
                        <Link href="/credits">Credits</Link>
                    </Button>
                    <Button asChild variant="link" className="text-foreground opacity-80">
                        <Link href="/privacy-policy">Privacy policy</Link>
                    </Button>
                </div>
                <div className="flex items-center justify-center opacity-80 sm:justify-end">
                    <MailButton />
                    <DiscordDialogButton />
                    <GithubButton />
                </div>
            </div>
        </footer>
    );
}
