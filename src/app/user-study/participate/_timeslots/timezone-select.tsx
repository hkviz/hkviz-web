'use client';

import { Check, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';

function getGmtOffset(timeZone: string) {
    const date = new Date(); // You can use any specific date here
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        timeZoneName: 'shortOffset',
    });

    const parts = formatter.formatToParts(date);
    const timeZonePart = parts.find((part) => part.type === 'timeZoneName');

    return timeZonePart ? `${timeZonePart.value}` : '?';
}

export interface TimezoneSelectProps {
    value: string;
    onChange: (value: string) => void;
}

export function TimezoneSelect({ value, onChange }: TimezoneSelectProps) {
    const options = useMemo(() => {
        const names = Intl.supportedValuesOf('timeZone');

        return names.map((name) => {
            const displayName = name.replaceAll('/', ' - ');
            const gmtOffset = getGmtOffset(name);
            return {
                displayName,
                name,
                value: (displayName + ' ' + gmtOffset).toLowerCase(), // also used for search
                gmtOffset,
            };
        });
    }, []);

    const [open, setOpen] = useState(false);
    const selectedOption = options.find((option) => option.name === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className=" justify-between">
                    {selectedOption?.displayName ?? 'Select timezone'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="max-h-[var(--radix-popover-content-available-height)] overflow-y-auto p-0">
                <Command>
                    <CommandInput placeholder="Search timezones..." />
                    <CommandEmpty>No timezone found.</CommandEmpty>
                    <CommandGroup>
                        <CommandList>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={(currentValue) => {
                                        const option = options.find((o) => o.value === currentValue)!;
                                        onChange(option.name);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            value === option.name ? 'opacity-100' : 'opacity-0',
                                        )}
                                    />
                                    {option.displayName}{' '}
                                    <span className="ml-1 text-xs opacity-60">({option.gmtOffset})</span>
                                </CommandItem>
                            ))}
                        </CommandList>
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
