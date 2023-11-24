import { cn } from '@/lib/utils';

export function ContentWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
    // t3 template: from-[#2e026d] to-[#15162c]
    // similar to hk initial menu style: from-[#233458] to-[#010103]
    // similar to lifeblood menu style: from-[#4585bc] to-[#06111d]
    return (
        <main
            className={cn(
                'flex grow flex-col bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[#6245bc94] to-[#06111d] text-white',
                className,
            )}
        >
            {children}
        </main>
    );
}

export function ContentCenterWrapper({ children }: { children: React.ReactNode }) {
    return <ContentWrapper className="items-center justify-center">{children}</ContentWrapper>;
}
