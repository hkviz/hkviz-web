import { cn } from '@/lib/utils';
import Image from 'next/image';

export type ThemedImageProps = {
    srcLight: React.ComponentProps<typeof Image>['src'];
    srcDark: React.ComponentProps<typeof Image>['src'];
    className?: string;
    alt: string;
};

export function ThemedImage({ srcLight, srcDark, className, alt }: ThemedImageProps) {
    return (
        <>
            <Image alt={alt} src={srcLight} className={cn('block dark:hidden', className)} />
            <Image alt={alt} src={srcDark} className={cn('hidden dark:block', className)} />
        </>
    );
}

export function ImageContainer({
    children,
    caption,
    className,
}: {
    children: React.ReactNode;
    caption?: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('mx-auto w-fit', className)}>
            <div className="group relative overflow-hidden rounded-md">{children}</div>
            {caption && <ImageCaption>{caption}</ImageCaption>}
        </div>
    );
}

export function ImageCaption({ children }: { children: React.ReactNode }) {
    return <div className="text-center text-sm">{children}</div>;
}
