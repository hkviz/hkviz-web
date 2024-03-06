import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { SiDiscord, SiGithub } from '@icons-pack/react-simple-icons';
import { ChevronRight, Mail } from 'lucide-react';
import { HKVizText } from './hkviz-text';

export const HOLLOW_KNIGHT_MODDING_DISCORD_URL = 'https://discord.com/servers/hollow-knight-modding-879125729936298015';

export function DiscordDialogButton({ children }: { children?: React.ReactNode }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children ?? (
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full">
                        <SiDiscord />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex flex-row items-center gap-2">
                        <SiDiscord />
                        <span>
                            <HKVizText /> - Discord
                        </span>
                    </DialogTitle>
                    <DialogDescription>
                        The <HKVizText /> discord channel is part of the larger Hollow Knight Modding Discord Server.
                        You need to join it first, to be able to access the <HKVizText /> channel.
                    </DialogDescription>
                    <DialogDescription>
                        The channel is located under <Badge variant="outline">Utility Mods</Badge>{' '}
                        <ChevronRight className="inline-block h-3 w-3" /> <Badge variant="outline">#hkviz</Badge>.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col justify-center gap-2 p-4 pt-2 align-baseline">
                    <Button asChild className="w-full">
                        <a href={HOLLOW_KNIGHT_MODDING_DISCORD_URL} target="_blank" rel="noreferrer">
                            1. Join the Modding Discord Server
                        </a>
                    </Button>
                    <Button asChild className="flex w-full flex-row items-baseline gap-1">
                        <a
                            href="https://discord.com/channels/879125729936298015/1194832408168648816"
                            target="_blank"
                            rel="noreferrer"
                        >
                            2. Open <HKVizText /> channel
                        </a>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function GithubButton() {
    return (
        <Button asChild variant="ghost" size="icon" className="h-12 w-12 rounded-full">
            <a href="https://github.com/hkviz" target="_blank" rel="noreferrer">
                <SiGithub />
            </a>
        </Button>
    );
}

export function MailButton() {
    return (
        <Button asChild variant="ghost" size="icon" className="h-12 w-12 rounded-full">
            <a href="mailto:hkviz@olii.dev">
                <Mail />
            </a>
        </Button>
    );
}
