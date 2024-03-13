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
                    To avoid spoilers, just <Link href="/guide/install">install the mod</Link>, and look at the
                    analytics and this page later.
                </AlertDescription>
            </div>
        </Alert>
    );
}
