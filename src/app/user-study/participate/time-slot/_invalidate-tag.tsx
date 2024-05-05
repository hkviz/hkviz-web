'use server';

import { revalidateTag } from 'next/cache';

// eslint-disable-next-line @typescript-eslint/require-await
export async function revalidateTagFromClient(tags: string[]): Promise<void> {
    tags.forEach((tag) => {
        revalidateTag(tag);
    });
}
