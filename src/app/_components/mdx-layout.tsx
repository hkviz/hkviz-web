import { ContentWrapper } from './content-wrapper';

export function MdxLayout({ children }: { children: React.ReactNode }) {
    // Create any shared layout or styles here
    return (
        <ContentWrapper backgroundClassName="opacity-30">
            <div className="prose dark:prose-invert mx-auto max-w-[90ch] p-4">{children}</div>
        </ContentWrapper>
    );
}
