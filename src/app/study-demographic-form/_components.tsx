'use client';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { type z } from 'zod';
import { countries, isCountryShortCode } from '~/lib/types/country';
import { genders } from '~/lib/types/gender';
import { hkExperiences } from '~/lib/types/hk-experience';
import { studyDemographicDefaultData, studyDemographicSchema } from '~/lib/types/study-demographic-data';

export interface StudyDemographicClientFormProps {
    requestCountryShortCode: string | undefined;
}

function RequiredStar() {
    return (
        <Tooltip>
            <TooltipTrigger>
                <span className="pl-2 text-red-500">*</span>
            </TooltipTrigger>
            <TooltipContent>Required</TooltipContent>
        </Tooltip>
    );
}

export function StudyDemographicClientForm(props: StudyDemographicClientFormProps) {
    const form = useForm<z.infer<typeof studyDemographicSchema>>({
        resolver: zodResolver(studyDemographicSchema),
        defaultValues: {
            ...studyDemographicDefaultData,
            country: isCountryShortCode(props.requestCountryShortCode) ? props.requestCountryShortCode : undefined,
        },
    });

    const watchGender = form.watch('gender');
    console.log(watchGender);

    function onSubmit(values: z.infer<typeof studyDemographicSchema>) {
        console.log(values);
    }

    const [countryOpen, setCountryOpen] = useState(false);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="previousHollowKnightExperience"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                How much experience do you have playing Hollow Knight?
                                <RequiredStar />
                            </FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select your experience" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {hkExperiences.map((it) => (
                                                <SelectItem key={it.code} value={it.code}>
                                                    {it.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Which most closely describes your gender?
                                <RequiredStar />
                            </FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {genders.map((it) => (
                                                <SelectItem key={it.code} value={it.code}>
                                                    {it.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {watchGender === 'not_listed' && (
                    <FormField
                        control={form.control}
                        name="genderCustom"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    My gender is
                                    <RequiredStar />
                                </FormLabel>
                                <FormControl>
                                    <Input className="w-full" placeholder="Enter a gender" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                In which country do you live?
                                <RequiredStar />
                            </FormLabel>
                            <FormControl>
                                <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn('w-[200px] w-full justify-between')}
                                            >
                                                {field.value
                                                    ? countries.find((c) => c.code === field.value)?.name
                                                    : 'Select a country'}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="max-h-[min(50vh,20rem)] overflow-y-scroll p-0">
                                        <Command>
                                            <CommandInput placeholder="Search a country..." />
                                            <CommandEmpty>No country found.</CommandEmpty>
                                            <CommandGroup>
                                                {countries.map((c) => (
                                                    <CommandItem
                                                        value={c.code + ' ' + c.name}
                                                        key={c.code}
                                                        onSelect={() => {
                                                            form.setValue('country', c.code);
                                                            setCountryOpen(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                'mr-2 h-4 w-4',
                                                                c.code === field.value ? 'opacity-100' : 'opacity-0',
                                                            )}
                                                        />
                                                        {c.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit">Submit</Button>
            </form>
        </Form>
    );
}
