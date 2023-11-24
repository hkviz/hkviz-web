'use client';

import { TooltipProvider } from '@/components/ui/tooltip';
import type { PropsWithChildren } from 'react';

export default function ClientContext({ children }: PropsWithChildren) {
    return <TooltipProvider>{children}</TooltipProvider>;
}
