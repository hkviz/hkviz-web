export function ReflowRow({ children }: { children: React.ReactNode }) {
    return <div className="flex flex-col md:flex-row">{children}</div>;
}

export function ReflowCell({ children }: { children: React.ReactNode }) {
    return (
        <div className="bottom-t grow border-black border-opacity-10 p-4 first:border-0 dark:border-white dark:border-opacity-10 md:basis-0 md:border-l md:border-t-0 md:first:border-0">
            {children}
        </div>
    );
}

export function ReflowCellHeader({ children }: { children: React.ReactNode }) {
    return <b className="block font-serif">{children}</b>;
}
