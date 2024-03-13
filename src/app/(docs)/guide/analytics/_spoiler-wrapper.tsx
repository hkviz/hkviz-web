'use client';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Expander } from '~/app/_components/expander';

export function SpoilerWrapper({ children, title }: { children: React.ReactNode; title: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Expander expanded={!isOpen}>
                <Button onClick={() => setIsOpen(true)}>{title}</Button>
            </Expander>
            <Expander expanded={isOpen}>{children}</Expander>
        </>
    );
}
