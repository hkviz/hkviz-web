export function ContentCenterWrapper({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex grow flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
            {children}
        </main>
    );
}

export function ContentWrapper({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex grow flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">{children}</main>
    );
}
