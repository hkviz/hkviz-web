import { cn } from '@/lib/utils';

export function ContentWrapper({
    children,
    className,
    backgroundClassName,
}: {
    children: React.ReactNode;
    className?: string;
    backgroundClassName?: string;
}) {
    // t3 template: from-[#2e026d] to-[#15162c]
    // similar to hk initial menu style: from-[#233458] to-[#010103]
    // similar to lifeblood menu style: from-[#4585bc] to-[#06111d]
    return (
        <div className="relative flex grow flex-col">
            <div
                className={cn(
                    'absolute inset-0 -z-10 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[#6245bc94]/60 to-[#c3cdd8]/60 bg-fixed dark:from-[#6245bc94]/60 dark:to-[#06111d]/60',
                    backgroundClassName,
                )}
            />
            <main className={cn('flex grow flex-col text-black dark:text-white', className)}>{children}</main>
        </div>
    );
}

export function ContentCenterWrapper({ children }: { children: React.ReactNode }) {
    return <ContentWrapper className="items-center justify-center">{children}</ContentWrapper>;
}
