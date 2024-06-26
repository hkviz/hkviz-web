import { Alert, AlertDescription, AlertTitle } from '@hkviz/components';
import { A } from '@solidjs/router';
import { Bell } from 'lucide-solid';

export function SpoilerWarningEarlyGame() {
    return (
        <Alert class="flex flex-row items-center gap-4 border-red-400 dark:border-red-800">
            <span class="inline-block text-red-400 dark:text-red-800">
                <Bell class="h-4 w-4 " />
            </span>
            <div>
                <AlertTitle>Early game spoiler warning!</AlertTitle>
                <AlertDescription>
                    If you would like to avoid spoilers, and use this mod to collect stats for your first playthrough,
                    you can follow the <A href="/guide/install">install guide</A>, and look at the stats and this guide
                    later.
                </AlertDescription>
            </div>
        </Alert>
    );
}
