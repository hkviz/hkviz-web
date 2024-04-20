'use client';

import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Asterisk, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type BaseSyntheticEvent } from 'react';
import { useForm } from 'react-hook-form';
import { type z } from 'zod';
import { routerRedirectToFlow } from '~/lib/navigation-flow/redirect';
import { type NavigationFlow } from '~/lib/navigation-flow/type';
import { ageRanges } from '~/lib/types/age-range';
import { countries, isCountryShortCode } from '~/lib/types/country';
import { studyDemographicDefaultData, studyDemographicSchema } from '~/lib/types/study-demographic-data';
import { api } from '~/trpc/react';
import { Expander } from '../_components/expander';

export interface StudyDemographicClientFormProps {
    requestCountryShortCode: string | undefined;
    navigationFlow: NavigationFlow | null;
    hasPreviouslySubmitted: boolean;
}

function RequiredStar() {
    return (
        <span>
            <Asterisk className="-mt-[0.5em] inline-block h-[1.2rem] w-[1.2rem] pl-2 text-red-500" />
        </span>
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

    const router = useRouter();
    const saveMutation = api.studyDemographics.save.useMutation();
    const watchGenderSelfDisclose = form.watch('genderPreferToSelfDescribe');
    const watchGenderPreferNotToDisclose = form.watch('genderPreferNotToDisclose');

    async function onSubmit(values: z.infer<typeof studyDemographicSchema>, event: BaseSyntheticEvent | undefined) {
        event?.preventDefault();
        saveMutation.reset();

        if (values.genderPreferNotToDisclose) {
            // other gender values are removed here, since they are not removed from the form state directly
            // so values are remembered when switching between not disclose and disclose
            values.genderWoman = false;
            values.genderMan = false;
            values.genderNonBinary = false;
            values.genderPreferToSelfDescribe = false;
            values.genderCustom = '';
        }

        await saveMutation.mutateAsync(values);

        if (props.navigationFlow) {
            routerRedirectToFlow({ router, flow: props.navigationFlow, urlPostfix: '?from=demographic' });
        }
    }

    const [countryOpen, setCountryOpen] = useState(false);

    if (props.hasPreviouslySubmitted) {
        return <CardContent>You have already submitted the demographic form. Thank you for participating</CardContent>;
    }

    if (saveMutation.isSuccess && !props.navigationFlow) {
        return (
            <CardContent>
                <span className="block">Your demographic data has been saved. Thanks for participating!</span>
                {props.navigationFlow && <span className="block text-green-600">You will be redirected</span>}
            </CardContent>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <fieldset disabled={saveMutation.isLoading || (saveMutation.isSuccess && !!props.navigationFlow)}>
                    <CardContent className="space-y-4">
                        {/* <FormField
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
                        /> */}

                        <FormField
                            control={form.control}
                            name="gender"
                            render={() => (
                                <FormItem>
                                    <FormLabel>
                                        What is your gender? <RequiredStar />
                                    </FormLabel>
                                    <FormMessage />
                                    <FormControl>
                                        <div className="space-y-2">
                                            <FormField
                                                control={form.control}
                                                name="genderWoman"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value && !watchGenderPreferNotToDisclose}
                                                                onCheckedChange={field.onChange}
                                                                disabled={watchGenderPreferNotToDisclose}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="pb-2 pl-2">woman</FormLabel>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="genderMan"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value && !watchGenderPreferNotToDisclose}
                                                                onCheckedChange={field.onChange}
                                                                disabled={watchGenderPreferNotToDisclose}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="pb-2 pl-2">man</FormLabel>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="genderNonBinary"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value && !watchGenderPreferNotToDisclose}
                                                                onCheckedChange={field.onChange}
                                                                disabled={watchGenderPreferNotToDisclose}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="pb-2 pl-2">non-binary</FormLabel>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="genderPreferNotToDisclose"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="pb-2 pl-2">
                                                            prefer not to disclose
                                                        </FormLabel>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="genderPreferToSelfDescribe"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value && !watchGenderPreferNotToDisclose}
                                                                disabled={watchGenderPreferNotToDisclose}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="pb-2 pl-2">
                                                            prefer to self-describe
                                                        </FormLabel>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Expander
                                                expanded={watchGenderSelfDisclose && !watchGenderPreferNotToDisclose}
                                            >
                                                <FormField
                                                    control={form.control}
                                                    name="genderCustom"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>My gender is</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    className="w-full"
                                                                    placeholder="Enter a gender"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </Expander>
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="ageRange"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Whats your age range?
                                        <RequiredStar />
                                    </FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select your age range" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {ageRanges
                                                        .filter((it) => !('removed' in it))
                                                        .map((it) => (
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
                            name="country"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Country of residence
                                        <RequiredStar />
                                    </FormLabel>
                                    <FormControl>
                                        <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            'w-full justify-between transition-none hover:bg-transparent',
                                                        )}
                                                    >
                                                        {field.value
                                                            ? countries.find((c) => c.code === field.value)?.name
                                                            : 'Select a country'}
                                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="max-h-[min(50vh,30rem)] overflow-y-scroll p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search a country..." />
                                                    <CommandEmpty>No country found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {countries.map((c) => {
                                                            const Icon = 'icon' in c ? c.icon : undefined;

                                                            return (
                                                                <CommandItem
                                                                    value={c.code + ' ' + c.name}
                                                                    key={c.code}
                                                                    onSelect={() => {
                                                                        form.setValue('country', c.code);
                                                                        setCountryOpen(false);
                                                                    }}
                                                                >
                                                                    {/* <Check
                                                            className={cn(
                                                                'mr-2 h-4 w-4',
                                                                c.code === field.value ? 'opacity-100' : 'opacity-0',
                                                            )}
                                                        /> */}
                                                                    {Icon && (
                                                                        <Icon
                                                                            className="mr-2 w-5 rounded-[2px]"
                                                                            role="presentation"
                                                                        />
                                                                    )}
                                                                    {c.name}
                                                                </CommandItem>
                                                            );
                                                        })}
                                                    </CommandGroup>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>

                    <CardFooter className="flex justify-end">
                        <Button type="submit">Continue</Button>
                    </CardFooter>
                </fieldset>
            </form>
        </Form>
    );
}
