'use client';

import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useId, useMemo, useState } from 'react';
import { routerRedirectToFlow } from '~/lib/navigation-flow/redirect';
import { type NavigationFlow } from '~/lib/navigation-flow/type';
import {
    hkExperienceCleaned,
    hkExperienceEmpty,
    hkExperienceFinished,
    type HkExperienceInput,
} from '~/lib/types/hk-experience';
import { playingFrequencyOptions, type PlayingFrequencyCode } from '~/lib/types/playing-frequency';
import { playingSinceOptions, type PlayingSinceCode } from '~/lib/types/playing-since';
import { api } from '~/trpc/react';
import { Expander } from '../_components/expander';

export interface HKExperienceFormProps {
    navigationFlow: NavigationFlow | null;
    existingHkExperience: HkExperienceInput | null;
}

function toBool(value: string | boolean) {
    return value === 'yes' || value === true;
}

function toBoolString(value: string | boolean | null | undefined) {
    if (value === null || value === undefined) return undefined;
    return toBool(value) ? 'yes' : 'no';
}

function FormFieldLabel(props: { htmlFor: string; children: React.ReactNode; className?: string }) {
    return (
        <Label className={cn('block w-full pb-2 pt-3', props.className)} htmlFor={props.htmlFor}>
            {props.children}
        </Label>
    );
}

export function HkExperienceClientForm(props: HKExperienceFormProps) {
    const id = useId();
    const ids = useMemo(() => {
        return {
            playingSince: id + 'playingSince',
            playingFrequency: id + 'playingFrequency',
            gotDreamnail: id + 'gotDreamnail',
            didEndboss: id + 'didEndboss',
            enteredWhitePalace: id + 'enteredWhitePalace',
            got112Percent: id + 'got112Percent',
            submitButton: id + 'submitButton',
        };
    }, [id]);
    function focusId(id: string) {
        setTimeout(() => {
            console.log('focus', id, document.getElementById(id));

            document.getElementById(id)?.focus();
        }, 150);
    }

    const [values, setValues] = useState(props.existingHkExperience ?? hkExperienceEmpty);

    const showFrequency = !!values.playingSince && values.playingSince !== 'never';
    const showDreamnail = showFrequency && !!values.playingFrequency;
    const showEndboss = showDreamnail && values.gotDreamnail === true;
    const showWhitePalace = showEndboss; // showed simultaneously with endboss
    const show112 = (showWhitePalace && values.didEndboss && values.enteredWhitePalace) ?? false;

    const existingFinished = props.existingHkExperience && hkExperienceFinished(props.existingHkExperience);
    const valuesFinished = hkExperienceFinished(values);

    const router = useRouter();
    const saveMutation = api.hkExperience.save.useMutation();

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        saveMutation.reset();

        const parsedValues = hkExperienceCleaned(values);
        await saveMutation.mutateAsync(parsedValues);

        if (props.navigationFlow) {
            routerRedirectToFlow({ router, flow: props.navigationFlow, urlPostfix: '?from=experience' });
        }
    }

    function updateValue<TKey extends keyof HkExperienceInput>({
        key,
        nextKey,
        value,
    }: {
        key: TKey;
        nextKey: keyof HkExperienceInput | null;
        value: HkExperienceInput[TKey];
    }) {
        const hadValueAlready = values[key] != null;
        const newValues = { ...values, [key]: value };
        const nextHasValue = nextKey ? newValues[nextKey] != null : false;
        setValues(newValues);
        if (!hadValueAlready || !nextHasValue) {
            if (!nextKey || hkExperienceFinished(newValues)) {
                focusId(ids.submitButton);
            } else {
                focusId(ids[nextKey]);
            }
        }
    }

    console.log(values);

    if (existingFinished) {
        return <CardContent>You have already submitted your experience. Thank you for participating!</CardContent>;
    }

    if (saveMutation.isSuccess && !props.navigationFlow) {
        return (
            <CardContent>
                <span className="block">Your Experience has been saved. Thanks for participating!</span>
                {props.navigationFlow && <span className="block text-green-600">You will be redirected</span>}
            </CardContent>
        );
    }

    return (
        <form onSubmit={onSubmit}>
            <fieldset disabled={saveMutation.isLoading || (saveMutation.isSuccess && !!props.navigationFlow)}>
                <CardContent>
                    <div>
                        <FormFieldLabel htmlFor={ids.playingSince} className="pt-0">
                            When did you first play Hollow Knight?
                        </FormFieldLabel>
                        <Select
                            value={values.playingSince ?? undefined}
                            onValueChange={(value) =>
                                updateValue({
                                    key: 'playingSince',
                                    nextKey: 'playingFrequency',
                                    value: value as PlayingSinceCode,
                                })
                            }
                        >
                            <SelectTrigger className="w-full" id={ids.playingSince}>
                                <SelectValue placeholder="Select a option" />
                            </SelectTrigger>
                            <SelectContent>
                                {playingSinceOptions.map((option) => (
                                    <SelectItem key={option.code} value={option.code}>
                                        {option.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Expander expanded={showFrequency}>
                        <FormFieldLabel htmlFor={ids.playingFrequency}>
                            How often have you been playing Hollow Knight recently?
                        </FormFieldLabel>
                        <Select
                            value={values.playingFrequency ?? undefined}
                            onValueChange={(value) =>
                                updateValue({
                                    key: 'playingFrequency',
                                    nextKey: 'gotDreamnail',
                                    value: value as PlayingFrequencyCode,
                                })
                            }
                        >
                            <SelectTrigger className="w-full" id={ids.playingFrequency}>
                                <SelectValue placeholder="Select a option" />
                            </SelectTrigger>
                            <SelectContent>
                                {playingFrequencyOptions.map((option) => (
                                    <SelectItem key={option.code} value={option.code}>
                                        {option.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Expander>
                </CardContent>
                <Expander expanded={showDreamnail}>
                    <CardHeader className="pt-0">
                        <CardTitle>Game Progress</CardTitle>
                        <CardDescription>How far have you progressed in Hollow Knight?</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div>
                            <FormFieldLabel htmlFor={ids.gotDreamnail} className="pt-0">
                                Did you already get the dreamnail and/or enter a dream?
                            </FormFieldLabel>
                            <ToggleGroup
                                type="single"
                                id={ids.gotDreamnail}
                                variant="outline"
                                className="mx-auto my-2 max-w-xs"
                                value={toBoolString(values.gotDreamnail)}
                                onValueChange={(value) =>
                                    updateValue({ key: 'gotDreamnail', value: toBool(value), nextKey: 'didEndboss' })
                                }
                            >
                                <ToggleGroupItem value="yes" aria-label="Toggle yes" className="grow">
                                    Yes
                                </ToggleGroupItem>
                                <ToggleGroupItem value="no" aria-label="Toggle no" className="grow">
                                    No
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </div>
                        <Expander expanded={showEndboss}>
                            <FormFieldLabel htmlFor={ids.didEndboss}>
                                Did you already defeat the endboss and see the credits?
                            </FormFieldLabel>
                            <ToggleGroup
                                type="single"
                                id={ids.didEndboss}
                                variant="outline"
                                className="mx-auto max-w-xs"
                                value={toBoolString(values.didEndboss)}
                                onValueChange={(value) =>
                                    updateValue({
                                        key: 'didEndboss',
                                        value: toBool(value),
                                        nextKey: 'enteredWhitePalace',
                                    })
                                }
                            >
                                <ToggleGroupItem value="yes" aria-label="Toggle yes" className="grow">
                                    Yes
                                </ToggleGroupItem>
                                <ToggleGroupItem value="no" aria-label="Toggle no" className="grow">
                                    No
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </Expander>
                        <Expander expanded={showWhitePalace}>
                            <FormFieldLabel htmlFor={ids.enteredWhitePalace}>
                                Did you already enter white palace?
                            </FormFieldLabel>
                            <ToggleGroup
                                type="single"
                                id={ids.enteredWhitePalace}
                                variant="outline"
                                className="mx-auto max-w-xs"
                                value={toBoolString(values.enteredWhitePalace)}
                                onValueChange={(value) =>
                                    updateValue({
                                        key: 'enteredWhitePalace',
                                        value: toBool(value),
                                        nextKey: 'got112Percent',
                                    })
                                }
                            >
                                <ToggleGroupItem value="yes" aria-label="Toggle yes" className="grow">
                                    Yes
                                </ToggleGroupItem>
                                <ToggleGroupItem value="no" aria-label="Toggle no" className="grow">
                                    No
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </Expander>
                        <Expander expanded={show112}>
                            <FormFieldLabel htmlFor={ids.got112Percent}>Did you reach 112% completion?</FormFieldLabel>
                            <ToggleGroup
                                type="single"
                                id={ids.got112Percent}
                                variant="outline"
                                className="mx-auto my-2 max-w-xs"
                                value={toBoolString(values.got112Percent)}
                                onValueChange={(value) =>
                                    updateValue({
                                        key: 'got112Percent',
                                        value: toBool(value),
                                        nextKey: null,
                                    })
                                }
                            >
                                <ToggleGroupItem value="yes" aria-label="Toggle yes" className="grow">
                                    Yes
                                </ToggleGroupItem>
                                <ToggleGroupItem value="no" aria-label="Toggle no" className="grow">
                                    No
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </Expander>
                    </CardContent>
                </Expander>

                <Expander expanded={valuesFinished}>
                    <CardFooter className="flex justify-end">
                        <Button type="submit" id={ids.submitButton}>
                            Continue
                        </Button>
                    </CardFooter>
                </Expander>
            </fieldset>
        </form>
    );
}
