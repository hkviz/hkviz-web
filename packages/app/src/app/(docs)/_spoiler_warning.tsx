import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bell } from 'lucide-react';
import Link from 'next/link';

export function SpoilerWarningEarlyGame() {
    return (
        <Alert className="flex flex-row items-center gap-4 border-red-400 dark:border-red-800">
            <span className="inline-block text-red-400 dark:text-red-800">
                <Bell className="h-4 w-4 " />
            </span>
            <div>
                <AlertTitle>Early game spoiler warning!</AlertTitle>
                <AlertDescription>
                    If you would like to avoid spoilers, and use this mod to collect stats for your first playthrough,
                    you can follow the <Link href="/guide/install">install guide</Link>, and look at the stats and this
                    guide later.
                </AlertDescription>
            </div>
        </Alert>
    );
}
