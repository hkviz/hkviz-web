import {
    Badge,
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@hkviz/components';
import { HKVizText } from '@hkviz/viz-ui';
import { ChevronRight, Mail } from 'lucide-solid';
import { siDiscord, siGithub } from 'simple-icons';
import { type Component } from 'solid-js';
import { SimpleIcon } from './simple-icon';

export const HOLLOW_KNIGHT_MODDING_DISCORD_URL = 'https://discord.com/servers/hollow-knight-modding-879125729936298015';

export const DiscordDialogButton: Component = () => {
    return (
        <Dialog>
            <DialogTrigger as={Button<'button'>} variant="ghost" size="icon" class="h-12 w-12 rounded-full">
                <SimpleIcon icon={siDiscord} />
            </DialogTrigger>
            <DialogContent class="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle class="flex flex-row items-center gap-2">
                        <SimpleIcon icon={siDiscord} />
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
                        <ChevronRight class="inline-block h-3 w-3" /> <Badge variant="outline">#hkviz</Badge>.
                    </DialogDescription>
                </DialogHeader>
                <div class="flex flex-col justify-center gap-2 p-4 pt-2 align-baseline">
                    <Button asChild class="w-full">
                        <a href={HOLLOW_KNIGHT_MODDING_DISCORD_URL} target="_blank" rel="noreferrer">
                            1. Join the Modding Discord Server
                        </a>
                    </Button>
                    <Button asChild class="flex w-full flex-row items-baseline gap-1">
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
};

export function GithubButton() {
    return (
        <Button asChild variant="ghost" size="icon" class="h-12 w-12 rounded-full">
            <a href="https://github.com/hkviz" target="_blank" rel="noreferrer">
                <SimpleIcon icon={siGithub} />
            </a>
        </Button>
    );
}

export function MailButton() {
    return (
        <Button asChild variant="ghost" size="icon" class="h-12 w-12 rounded-full">
            <a href="mailto:support@hkviz.org">
                <Mail />
            </a>
        </Button>
    );
}
