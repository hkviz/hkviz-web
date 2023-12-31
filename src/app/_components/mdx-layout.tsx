import { cn } from '@/lib/utils';
import { ContentWrapper } from './content-wrapper';

export function MdxLayout({ children }: { children: React.ReactNode }) {
    // Create any shared layout or styles here
    return (
        <MdxOuterWrapper>
            <MdxInnerWrapper>{children}</MdxInnerWrapper>
        </MdxOuterWrapper>
    );
}

export function MdxOuterWrapper({ children }: { children: React.ReactNode }) {
    return <ContentWrapper backgroundClassName="dark:opacity-40 opacity-20">{children}</ContentWrapper>;
}

export function MdxInnerWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn('prose mx-auto my-[4rem] max-w-[90ch] p-4 dark:prose-invert', className)}>{children}</div>
    );
}
