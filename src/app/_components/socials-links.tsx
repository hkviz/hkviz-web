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

export function DiscordDialogButton() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full">
                    <SiDiscord />
                </Button>
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
                        To open the <HKVizText /> channel you need to join the Hollow Knight Modding Discord Server
                        first.
                    </DialogDescription>
                    <DialogDescription>
                        The channel is located under <Badge variant="outline">Utility Mods</Badge>{' '}
                        <ChevronRight className="inline-block h-3 w-3" /> <Badge variant="outline">#hkviz</Badge>.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col justify-center gap-2 p-4 pt-2 align-baseline">
                    <Button asChild className="w-full">
                        <a href="https://discord.com/invite/hkmodding" target="_blank" rel="noreferrer">
                            Join the Modding Discord Server
                        </a>
                    </Button>
                    <Button asChild className="flex w-full flex-row items-baseline gap-1">
                        <a
                            href="https://discord.com/channels/879125729936298015/1194832408168648816"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Open <HKVizText /> channel
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
            <a href="mailto:mailto:hkviz@olii.dev">
                <Mail />
            </a>
        </Button>
    );
}
