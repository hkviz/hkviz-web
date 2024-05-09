import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import React from 'react';

export const TabsTriggerTransparent = React.forwardRef<
    React.ElementRef<typeof TabsTrigger>,
    React.ComponentPropsWithoutRef<typeof TabsTrigger>
>(({ className, ...props }, ref) => (
    <TabsTrigger
        ref={ref}
        className={cn('data-[state=active]:bg-slate-300 dark:data-[state=active]:bg-slate-800', className)}
        {...props}
    />
));

export const TabsListTransparent = React.forwardRef<
    React.ElementRef<typeof TabsList>,
    React.ComponentPropsWithoutRef<typeof TabsList>
>(({ className, ...props }, ref) => <TabsList ref={ref} className={cn('bg-transparent', className)} {...props} />);
