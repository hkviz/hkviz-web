import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { HKVizText } from '~/app/_components/hkviz-text';
import OverviewDarkSrc from './screenshots/overview_dark.png';
import OverviewLightSrc from './screenshots/overview_light.png';

type ThemedImageProps = {
    srcLight: React.ComponentProps<typeof Image>['src'];
    srcDark: React.ComponentProps<typeof Image>['src'];
    className?: string;
    alt: string;
};

function ThemedImage({ srcLight, srcDark, className, alt }: ThemedImageProps) {
    return (
        <>
            <Image alt={alt} src={srcLight} className={cn('block dark:hidden', className)} />
            <Image alt={alt} src={srcDark} className={cn('hidden dark:block', className)} />
        </>
    );
}

function ImageContainer({ children, caption }: { children: React.ReactNode; caption: React.ReactNode }) {
    return (
        <div>
            <div className="group relative overflow-hidden rounded-md">{children}</div>
            <ImageCaption>{caption}</ImageCaption>
        </div>
    );
}

function ImageArea({ className, children, href }: { className: string; children: React.ReactNode; href: string }) {
    return (
        <Button
            className={cn(
                'absolute z-20 rounded-sm border-2 border-red-600 bg-transparent p-0 text-transparent no-underline shadow-[0_0_0_100vmax_rgba(0,0,0,0)] drop-shadow-glow-md transition duration-200 ease-in-out hover:z-10 hover:bg-transparent hover:bg-opacity-0 hover:shadow-[0_0_0_100vmax_rgba(0,0,0,0.7)] group-hover:text-red-600 group-hover:opacity-100 dark:border-red-600 dark:drop-shadow-2xl dark:group-hover:text-red-600',
                className,
            )}
            asChild
        >
            <a href={href}>{children}</a>
        </Button>
    );
}

function ImageCaption({ children }: { children: React.ReactNode }) {
    return <div className="text-center text-sm">{children}</div>;
}

export function OverviewScreenshot() {
    return (
        <ImageContainer
            caption={
                <>
                    <HKVizText /> gameplay analytics page
                </>
            }
        >
            <ThemedImage
                srcLight={OverviewLightSrc}
                srcDark={OverviewDarkSrc}
                className="m-0"
                alt="HKViz gameplay analytics page"
            />
            <ImageArea className="left-[1%] top-[9%] h-[32%] w-[28%]" href="#map-options">
                Map options
            </ImageArea>
            <ImageArea className="left-[1%] top-[42%] h-[57%] w-[28%]" href="#room-analytics">
                Room analytics
            </ImageArea>
            <ImageArea className="left-[30%] top-[9%] h-[83%] w-[38%]" href="#map">
                Map
            </ImageArea>
            <ImageArea className="left-[30%] top-[93%] h-[6%] w-[38%]" href="#timeline">
                Timeline
            </ImageArea>
            <ImageArea className="left-[68.5%] top-[9%] h-[90%] w-[31%]" href="#splits">
                Splits
            </ImageArea>
            {/* <ImageArea className="left-[82%] top-[9%] h-[8%] w-[10%]" href="#time-charts">
                Time charts
            </ImageArea> */}
        </ImageContainer>
    );
}
