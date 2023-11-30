import { cn } from '@/lib/utils';
import { type MaterialSymbol } from 'material-symbols';
import { type CSSProperties } from 'react';
import { materialSymbols } from '~/styles/fonts';

const style: CSSProperties = {
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: '1',
    letterSpacing: 'normal',
    textTransform: 'none',
    display: 'inline-block',
    width: '1em',
    height: '1em',
    whiteSpace: 'nowrap',
    wordWrap: 'normal',
    direction: 'ltr',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    textRendering: 'optimizeLegibility',
    fontFeatureSettings: 'liga',
    userSelect: 'none',
};

export function MatSymbol({
    icon,
    className,
    fontSize = '1.5em',
}: {
    icon: MaterialSymbol;
    className?: string;
    fontSize?: CSSProperties['fontSize'];
}) {
    return (
        <span style={{ ...style, fontSize }} className={cn(materialSymbols.className, className)}>
            {icon}
        </span>
    );
}
