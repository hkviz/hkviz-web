import { BellIcon } from 'lucide-solid';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { AA } from '~/lib/routing/AA';

export function SpoilerWarningEarlyGame() {
	return (
		<Alert class="flex flex-row items-center gap-4 border-red-400 dark:border-red-800">
			<span class="inline-block text-red-400 dark:text-red-800">
				<BellIcon class="h-4 w-4" />
			</span>
			<div>
				<AlertTitle>Early game spoiler warning!</AlertTitle>
				<AlertDescription>
					If you would like to avoid spoilers, and use this mod to collect stats for your first playthrough,
					you can follow the <AA href="/guide/install">Gameplay Recording Guide</AA>, and look at this guide
					later.
				</AlertDescription>
			</div>
		</Alert>
	);
}
