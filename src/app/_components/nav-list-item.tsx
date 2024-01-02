import { NavigationMenuLink } from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { type MaterialSymbol } from 'material-symbols';
import React from 'react';
import { MatSymbol } from './mat-symbol';

type Props = React.ComponentPropsWithoutRef<'a'> & {
    icon?: MaterialSymbol;
};

export const ListItem = React.forwardRef<React.ElementRef<'a'>, Props>(
    ({ className, title, children, icon, ...props }, ref) => {
        return (
            <li>
                <NavigationMenuLink asChild>
                    <a
                        ref={ref}
                        className={cn(
                            'flex select-none flex-row items-center justify-center gap-4 space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                            className,
                        )}
                        {...props}
                    >
                        {icon && <MatSymbol icon={icon} className="text-2xl font-light" />}
                        <div className="grow">
                            <div className="text-sm font-medium leading-none">{title}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
                        </div>
                    </a>
                </NavigationMenuLink>
            </li>
        );
    },
);
ListItem.displayName = 'ListItem';
