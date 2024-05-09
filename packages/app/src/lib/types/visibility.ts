import { Globe, Lock, Unlock } from 'lucide-react';
import { z } from 'zod';

export const visibilities = [
    {
        code: 'public',
        name: 'Public',
        Icon: Globe,
    },
    {
        code: 'unlisted',
        name: 'Unlisted',
        Icon: Unlock,
    },
    {
        code: 'private',
        name: 'Private',
        Icon: Lock,
    },
] as const;

type CodesOf<T extends readonly { code: unknown }[]> = {
    [I in keyof T]: T[I]['code'];
};

type VisibilityCodes = CodesOf<typeof visibilities>;
export type VisibilityCode = VisibilityCodes[number];
export const visibilityCodes = visibilities.map((it) => it.code) as unknown as VisibilityCodes;

export const visibilitySchema = z.enum(visibilityCodes);

export function visibilityByCode(code: VisibilityCode) {
    return visibilities.find((it) => it.code === code)!;
}
