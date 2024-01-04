'use client';

import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { hkExperienceCleaned, hkExperienceEmpty, hkExperienceFinished } from '~/lib/types/hk-experience';
import { api } from '~/trpc/react';
import { Expander } from '../_components/expander';

export interface HKExperienceFormProps {
    hasIngameAuthCookie: boolean;
    hasPreviouslySubmitted: boolean;
}

function toBool(value: string | boolean) {
    return value === 'yes' || value === true;
}

function toBoolString(value: string | boolean | undefined) {
    if (value === undefined) return undefined;
    return toBool(value) ? 'yes' : 'no';
}

export function HkExperienceClientForm(props: HKExperienceFormProps) {
    const [values, setValues] = useState(hkExperienceEmpty);

    const showDreamnail = values.playedBefore === true;
    const showEndboss = showDreamnail && values.gotDreamnail === true;
    const showWhitePalace = showEndboss; // showed simultaneously with endboss
    const show112 = showWhitePalace && values.didEndboss && values.enteredWhitePalace;

    const showSubmit = hkExperienceFinished(values);

    const router = useRouter();
    const saveMutation = api.hkExperience.save.useMutation();

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        saveMutation.reset();

        const parsedValues = hkExperienceCleaned(values);
        await saveMutation.mutateAsync(parsedValues);

        if (props.hasIngameAuthCookie) {
            router.push('/ingameauth/cookie');
        }
    }

    if (props.hasPreviouslySubmitted) {
        return <CardContent>You have already submitted your experience. Thank you for participating</CardContent>;
    }

    if (saveMutation.isSuccess) {
        return (
            <CardContent>
                <span className="block">Your Experience has been saved. Thanks for participating!</span>
                {props.hasIngameAuthCookie && (
                    <span className="block text-green-600">You will be redirected to the login page now</span>
                )}
            </CardContent>
        );
    }

    return (
        <form onSubmit={onSubmit}>
            <fieldset disabled={saveMutation.isLoading}>
                <CardContent>
                    <div>
                        <Label className="w-full" htmlFor="playedBefore">
                            Did you play HollowKnight before?
                        </Label>
                        <ToggleGroup
                            type="single"
                            id="playedBefore"
                            variant="outline"
                            className="mx-auto my-2 max-w-xs"
                            value={toBoolString(values.playedBefore)}
                            onValueChange={(value) => setValues({ ...values, playedBefore: toBool(value) })}
                        >
                            <ToggleGroupItem value="yes" aria-label="Toggle yes" className="grow">
                                Yes
                            </ToggleGroupItem>
                            <ToggleGroupItem value="no" aria-label="Toggle no" className="grow">
                                No
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                    <Expander expanded={showDreamnail}>
                        <Label className="w-full" htmlFor="gotDreamnail">
                            Did you already get the dreamnail and/or enter a dream?
                        </Label>
                        <ToggleGroup
                            type="single"
                            id="gotDreamnail"
                            variant="outline"
                            className="mx-auto my-2 max-w-xs"
                            value={toBoolString(values.gotDreamnail)}
                            onValueChange={(value) => setValues({ ...values, gotDreamnail: toBool(value) })}
                        >
                            <ToggleGroupItem value="yes" aria-label="Toggle yes" className="grow">
                                Yes
                            </ToggleGroupItem>
                            <ToggleGroupItem value="no" aria-label="Toggle no" className="grow">
                                No
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </Expander>
                    <Expander expanded={showEndboss}>
                        <Label className="w-full" htmlFor="didEndboss">
                            Did you already defeat the endboss?
                        </Label>
                        <ToggleGroup
                            type="single"
                            id="didEndboss"
                            variant="outline"
                            className="mx-auto my-2 max-w-xs"
                            value={toBoolString(values.didEndboss)}
                            onValueChange={(value) => setValues({ ...values, didEndboss: toBool(value) })}
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
                        <Label className="w-full" htmlFor="enteredWhitePalace">
                            Did you already enter white palace?
                        </Label>
                        <ToggleGroup
                            type="single"
                            id="enteredWhitePalace"
                            variant="outline"
                            className="mx-auto my-2 max-w-xs"
                            value={toBoolString(values.enteredWhitePalace)}
                            onValueChange={(value) => setValues({ ...values, enteredWhitePalace: toBool(value) })}
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
                        <Label className="w-full" htmlFor="got112Percent">
                            Did you reach 112% completion?
                        </Label>
                        <ToggleGroup
                            type="single"
                            id="got112Percent"
                            variant="outline"
                            className="mx-auto my-2 max-w-xs"
                            value={toBoolString(values.got112Percent)}
                            onValueChange={(value) => setValues({ ...values, got112Percent: toBool(value) })}
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

                <Expander expanded={showSubmit}>
                    <CardFooter className="flex justify-end">
                        <Button type="submit">Continue</Button>
                    </CardFooter>
                </Expander>
            </fieldset>
        </form>
    );
}
