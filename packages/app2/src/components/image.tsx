import { For, createMemo, splitProps, type ComponentProps } from 'solid-js';

// export interface LqipImage {
//     lqip: string;
//     width: number;
//     height: number;
//     src: string;
// }

export interface ImageToolsPicture {
    sources: Record<string, string>;
    img: {
        src: string;
        w: number;
        h: number;
    };
}

export type OptimizedImageSrc = ImageToolsPicture;

export function Image(
    props: Omit<ComponentProps<'img'>, 'src' | 'sizes'> & {
        src: OptimizedImageSrc;
        sizes?: string | ((nativeWidth: number) => string);
    },
) {
    const [, imgProps] = splitProps(props, ['src']);
    const sizes = createMemo(() => (typeof props.sizes === 'function' ? props.sizes(props.src.img.w) : props.sizes));

    return (
        <picture>
            <For each={Object.entries(props.src.sources)}>
                {([format, src]) => <source srcset={src} type={'image/' + format} sizes={sizes()} />}
            </For>
            <img
                {...imgProps}
                sizes={sizes()}
                src={props.src.img.src}
                alt={props.alt}
                width={props.src.img.w}
                height={props.src.img.h}
                // style={{ 'background-image': `url("${props.src.lqip}")`, 'background-size': 'cover' }}
                loading="lazy"
            />
        </picture>
    );
}

export const IMAGE_SIZE_ARTICLE_FULL_WIDTH = (nativeWidth: number) => `min(90ch,calc(100vw-2rem),${nativeWidth}px)`;
export const IMAGE_SIZE_ARTICLE_RESPONSIVE_THIRD = (nativeWidth: number) =>
    `(min-width: 768px) min(30ch,calc(33.333vw-1rem)), ${IMAGE_SIZE_ARTICLE_FULL_WIDTH(nativeWidth)}`;

export const IMAGE_SIZE_MAX_W_48 = (nativeWidth: number) => `min(12rem,${nativeWidth}px)`;
export const IMAGE_SIZE_MAX_W_60 = (nativeWidth: number) => `min(15rem,${nativeWidth}px)`;
export const IMAGE_SIZE_MAX_W_30REM = (nativeWidth: number) => `min(30rem,${nativeWidth}px)`;
