import { NavigationMenuLink } from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';
import React, { type ReactNode } from 'react';

type Props = Omit<React.ComponentPropsWithoutRef<'a'>, 'title'> & {
    Icon?: LucideIcon;
    title: ReactNode;
};

export const ListItem = React.forwardRef<React.ElementRef<'a'>, Props>(
    ({ className, title, children, Icon, ...props }, ref) => {
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
                        {Icon && <Icon className="text-2xl font-light" />}
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
