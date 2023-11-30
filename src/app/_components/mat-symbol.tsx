import { cn } from '@/lib/utils';
import { type MaterialSymbol } from 'material-symbols';
import { materialSymbols } from '~/styles/fonts';

export function MatSymbol({ icon, className }: { icon: MaterialSymbol; className?: string }) {
    return <span className={cn(materialSymbols.className, 'icon-material-symbol', className)}>{icon}</span>;
}
