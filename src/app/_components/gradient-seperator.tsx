import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export function GradientSeperator({ className }: { className?: string }) {
    return (
        <Separator
            className={cn(
                'my-4 bg-transparent bg-gradient-to-r from-transparent via-current to-transparent',
                className,
            )}
        />
    );
}
