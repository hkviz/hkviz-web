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
    return <ContentWrapper backgroundClassName="opacity-30">{children}</ContentWrapper>;
}

export function MdxInnerWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn('prose mx-auto max-w-[90ch] p-4 dark:prose-invert', className)}>{children}</div>;
}
